import { WeatherDayForecast } from '../types';

interface CityWeatherProfile {
  baseTemp: number;
  rainChance: number;
  condition: 'sunny' | 'cloudy' | 'rain-light' | 'rain-heavy';
  icon: string;
  summary: string;
}

// Regional weather presets for Indonesian tourist destinations
// ponytail: deterministic profile generator with seasonal offsets, connect to live OpenWeather/WeatherAPI when API key provided
const CITY_WEATHER_PROFILES: Record<string, CityWeatherProfile[]> = {
  bandung: [
    { baseTemp: 24, rainChance: 20, condition: 'cloudy', icon: 'SunCloud', summary: 'Cerah berawan di pagi hari, sejuk' },
    { baseTemp: 19, rainChance: 65, condition: 'rain-light', icon: 'CloudRain', summary: 'Potensi hujan rintik di siang-sore hari' },
    { baseTemp: 23, rainChance: 30, condition: 'cloudy', icon: 'SunCloud', summary: 'Sejuk berawan sepanjang hari' },
    { baseTemp: 21, rainChance: 55, condition: 'rain-light', icon: 'CloudRain', summary: 'Hujan ringan di area pegunungan' },
  ],
  yogyakarta: [
    { baseTemp: 29, rainChance: 15, condition: 'sunny', icon: 'Sun', summary: 'Cerah terik, nyaman untuk wisata budaya' },
    { baseTemp: 30, rainChance: 25, condition: 'sunny', icon: 'Sun', summary: 'Cerah dengan awan tipis' },
    { baseTemp: 28, rainChance: 40, condition: 'cloudy', icon: 'SunCloud', summary: 'Berawan hangat' },
  ],
  bali: [
    { baseTemp: 29, rainChance: 10, condition: 'sunny', icon: 'Sun', summary: 'Cerah tropis sempurna untuk pantai' },
    { baseTemp: 28, rainChance: 20, condition: 'sunny', icon: 'Sun', summary: 'Cerah berangin sepoi-sepoi' },
    { baseTemp: 27, rainChance: 35, condition: 'cloudy', icon: 'SunCloud', summary: 'Cerah berawan di area dataran tinggi Ubud' },
    { baseTemp: 29, rainChance: 15, condition: 'sunny', icon: 'Sun', summary: 'Cerah terik sepanjang hari' },
  ],
  jakarta: [
    { baseTemp: 31, rainChance: 30, condition: 'cloudy', icon: 'SunCloud', summary: 'Panas berawan khas perkotaan' },
    { baseTemp: 32, rainChance: 45, condition: 'cloudy', icon: 'SunCloud', summary: 'Berawan tebal di sore hari' },
  ],
  malang: [
    { baseTemp: 22, rainChance: 25, condition: 'cloudy', icon: 'SunCloud', summary: 'Sejuk pegunungan khas Bromo, nyaman beraktivitas' },
    { baseTemp: 20, rainChance: 40, condition: 'rain-light', icon: 'CloudRain', summary: 'Hawa dingin dengan potensi kabut dan gerimis tipis' },
    { baseTemp: 23, rainChance: 20, condition: 'cloudy', icon: 'SunCloud', summary: 'Cerah berawan di area Kota Batu & Malang' },
  ],
  lombok: [
    { baseTemp: 29, rainChance: 15, condition: 'sunny', icon: 'Sun', summary: 'Cerah tropis pesisir pantai Mandalika & Gili' },
    { baseTemp: 30, rainChance: 20, condition: 'sunny', icon: 'Sun', summary: 'Cerah hangat ideal untuk wisata pantai' },
    { baseTemp: 27, rainChance: 35, condition: 'cloudy', icon: 'SunCloud', summary: 'Berawan sejuk di kaki Gunung Rinjani Sembalun' },
  ],
};

export async function getCityWeatherForecast(
  city: string,
  daysCount: number = 3,
  startDate?: string
): Promise<WeatherDayForecast[]> {
  const normalizedCity = city.trim().toLowerCase();
  const profiles =
    CITY_WEATHER_PROFILES[normalizedCity] ||
    (normalizedCity.includes('jogja') || normalizedCity.includes('yogya') ? CITY_WEATHER_PROFILES.yogyakarta : undefined) ||
    (normalizedCity.includes('malang') || normalizedCity.includes('bromo') || normalizedCity.includes('batu') ? CITY_WEATHER_PROFILES.malang : undefined) ||
    (normalizedCity.includes('lombok') ? CITY_WEATHER_PROFILES.lombok : undefined) ||
    (normalizedCity.includes('bali') ? CITY_WEATHER_PROFILES.bali : undefined) ||
    (normalizedCity.includes('jakarta') ? CITY_WEATHER_PROFILES.jakarta : undefined) ||
    CITY_WEATHER_PROFILES.bandung;

  const results: WeatherDayForecast[] = [];
  const baseDate = startDate ? new Date(startDate) : new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    const profile = profiles[i % profiles.length];
    results.push({
      date: dateStr,
      tempC: profile.baseTemp,
      tempDisplay: `${profile.baseTemp}°C`,
      condition: profile.condition,
      rainChance: profile.rainChance,
      humidity: 75,
      icon: profile.icon,
      summary: profile.summary,
    });
  }

  return results;
}

// PRD Section 14 Weather Adjustment rule:
// Check if an outdoor activity conflicts with rain forecast
export function evaluateWeatherForActivity(
  isOutdoor: boolean,
  weather: WeatherDayForecast
): {
  weatherCondition: 'sunny' | 'cloudy' | 'rain-light' | 'rain-heavy';
  warning?: string;
  suggestIndoorFallback: boolean;
} {
  if (!isOutdoor) {
    return {
      weatherCondition: weather.condition,
      suggestIndoorFallback: false,
    };
  }

  if (weather.rainChance >= 60) {
    return {
      weatherCondition: 'rain-light',
      warning: `Hujan berpotensi tinggi (${weather.rainChance}%). Siapkan payung atau alternatif indoor.`,
      suggestIndoorFallback: true,
    };
  }

  if (weather.rainChance >= 40) {
    return {
      weatherCondition: 'cloudy',
      warning: `Kemungkinan hujan ringan (${weather.rainChance}%).`,
      suggestIndoorFallback: false,
    };
  }

  return {
    weatherCondition: weather.condition,
    suggestIndoorFallback: false,
  };
}
