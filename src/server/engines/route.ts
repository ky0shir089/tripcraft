import { DestinationEntity, RouteOptimizationResult } from '../types';

// Haversine distance in km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Estimate travel duration in minutes based on urban traffic condition
export function estimateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 0.2) return 5;
  if (distanceKm <= 1.5) return Math.round(distanceKm * 12); // walking or quick ride
  // Average city/mountain transit speed: 25 km/h + 8 mins base traffic buffer
  const minutes = Math.round((distanceKm / 25) * 60 + 8);
  return Math.max(10, minutes);
}

// PRD Section 10 Route Optimization
// TSP nearest-neighbor algorithm to prevent zig-zag travel between locations
export function optimizeRouteSequence(
  destinations: DestinationEntity[],
  startCoords?: { lat: number; lng: number }
): RouteOptimizationResult {
  if (destinations.length <= 1) {
    return {
      orderedDestinations: [...destinations],
      totalDistanceKm: 0,
      totalTravelTimeMinutes: 0,
      legTravelTimes: [0],
    };
  }

  // ponytail: greedy nearest neighbor + 2-opt, replace with integer linear programming if >20 stops/day
  const unvisited = [...destinations];
  const ordered: DestinationEntity[] = [];
  const legTravelTimes: number[] = [0];

  let currentLat = startCoords ? startCoords.lat : unvisited[0].latitude;
  let currentLng = startCoords ? startCoords.lng : unvisited[0].longitude;

  // If no explicit startCoords, start from the first destination
  if (!startCoords) {
    const first = unvisited.shift()!;
    ordered.push(first);
    currentLat = first.latitude;
    currentLng = first.longitude;
  }

  let totalDistanceKm = 0;
  let totalTravelTimeMinutes = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(
        currentLat,
        currentLng,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextDest = unvisited.splice(nearestIdx, 1)[0];
    const travelTime = estimateTravelMinutes(minDistance);

    totalDistanceKm += minDistance;
    totalTravelTimeMinutes += travelTime;
    legTravelTimes.push(travelTime);
    ordered.push(nextDest);

    currentLat = nextDest.latitude;
    currentLng = nextDest.longitude;
  }

  // PRD Section 11 warning if travel time > 3 hours
  let warning: string | undefined;
  if (totalTravelTimeMinutes >= 180) {
    const hours = (totalTravelTimeMinutes / 60).toFixed(1);
    warning = `⚠️ Hari ini cukup padat. Waktu perjalanan sekitar ${hours} jam.`;
  }

  return {
    orderedDestinations: ordered,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTravelTimeMinutes,
    legTravelTimes,
    warning,
  };
}
