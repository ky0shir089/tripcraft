import { ActivityItem, DayItinerary, PaceType } from '@/types/trip';
import { DestinationEntity, WeatherDayForecast } from '../types';
import { optimizeRouteSequence } from './route';
import { evaluateWeatherForActivity } from './weather';

// Helper to add minutes to 'HH:mm' time string
function addMinutes(timeStr: string, minutesToAdd: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMins = hours * 60 + mins + minutesToAdd;
  const wrappedMins = totalMins % (24 * 60);
  const h = Math.floor(wrappedMins / 60)
    .toString()
    .padStart(2, '0');
  const m = (wrappedMins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Convert 'HH:mm' to minutes from midnight
function toMinutes(timeStr: string): number {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

// Map destination category to UI Activity category
function mapCategory(
  cat: DestinationEntity['category']
): ActivityItem['category'] {
  switch (cat) {
    case 'culinary':
      return 'culinary';
    case 'cafe':
      return 'cafe';
    case 'nature':
      return 'nature';
    case 'culture':
    case 'history':
    case 'religious':
      return 'culture';
    case 'shopping':
      return 'shopping';
    case 'adventure':
      return 'adventure';
    case 'hotel':
      return 'hotel';
    default:
      return 'culture';
  }
}

// PRD Section 9 Itinerary Engine & Section 11 Pace
export function buildDayItinerary(
  dayNumber: number,
  dateStr: string,
  theme: string,
  destinations: DestinationEntity[],
  weather: WeatherDayForecast,
  pace: PaceType = 'balanced'
): DayItinerary {
  // 1. Filter / Slice destination count per pace constraint
  let maxActivities = 5;
  if (pace === 'relaxed') maxActivities = 3;
  if (pace === 'packed') maxActivities = 7;

  const selectedDestinations = destinations.slice(0, maxActivities);

  // 2. Optimize route order to prevent zig-zag
  const routeResult = optimizeRouteSequence(selectedDestinations);
  const ordered = routeResult.orderedDestinations;

  const activities: ActivityItem[] = [];
  let currentTime = dayNumber === 1 ? '10:00' : '08:30';

  for (let i = 0; i < ordered.length; i++) {
    const dest = ordered[i];
    const travelTime = routeResult.legTravelTimes[i] ?? 15;

    // Apply travel time to reach location
    if (i > 0 && travelTime > 0) {
      currentTime = addMinutes(currentTime, travelTime);
    }

    // Opening hours validation check
    const currentMins = toMinutes(currentTime);
    const openMins = toMinutes(dest.openingTime || '08:00');
    const closeMins = toMinutes(dest.closingTime || '21:00');

    // If reached before opening, adjust to opening time
    if (currentMins < openMins) {
      currentTime = dest.openingTime;
    }

    // Weather impact evaluation
    const weatherEval = evaluateWeatherForActivity(dest.outdoor, weather);

    let notes = dest.description;
    const weatherWarning = weatherEval.warning;

    if (weatherEval.suggestIndoorFallback && dest.outdoor) {
      notes += ' (Opsi alternatif cuaca: area berteduh/indoor terdekat)';
    }

    // If closing time conflict, flag warning
    if (toMinutes(currentTime) + dest.estimatedDurationMinutes > closeMins) {
      notes += ` (Perhatian: lokasi tutup pukul ${dest.closingTime})`;
    }

    activities.push({
      id: `act-${dayNumber}-${i + 1}`,
      time: currentTime,
      title: dest.name,
      location: `${dest.name}, ${dest.city}`,
      category: mapCategory(dest.category),
      durationMinutes: dest.estimatedDurationMinutes,
      travelTimeFromPrevMinutes: travelTime,
      cost: dest.estimatedCost,
      isOutdoor: dest.outdoor,
      weatherCondition: weatherEval.weatherCondition,
      weatherWarning,
      notes,
      coordinates: {
        lat: dest.latitude,
        lng: dest.longitude,
      },
    });

    // Advance current time by visit duration + small rest buffer
    currentTime = addMinutes(currentTime, dest.estimatedDurationMinutes + 15);
  }

  // Day warning from route or pace
  let dayWarning = routeResult.warning;
  if (!dayWarning && weather.rainChance >= 60) {
    dayWarning = `🌧️ Potensi hujan ${weather.rainChance}%. Siapkan perlengkapan hujan untuk aktivitas luar ruangan.`;
  }

  return {
    dayNumber,
    dateStr,
    theme,
    weatherSummary: {
      temp: weather.tempDisplay,
      condition: weather.summary,
      rainChance: weather.rainChance,
      icon: weather.icon,
    },
    warning: dayWarning,
    activities,
  };
}
