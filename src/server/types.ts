import {
  ActivityPreference,
  RatingValue,
  TravelStyle,
  PaceType,
  TransportType,
  AccommodationType,
  BudgetBreakdown,
  ChatMessage,
  TripPlan,
} from '@/types/trip';

export type DestinationCategory =
  | 'nature'
  | 'culture'
  | 'culinary'
  | 'history'
  | 'shopping'
  | 'cafe'
  | 'adventure'
  | 'family'
  | 'religious'
  | 'photography'
  | 'beach'
  | 'nightlife'
  | 'hotel'
  | 'transit';

export interface DestinationEntity {
  id: string;
  name: string;
  city: string;
  description: string;
  category: DestinationCategory;
  preferenceCategory: ActivityPreference;
  latitude: number;
  longitude: number;
  estimatedDurationMinutes: number;
  estimatedCost: number;
  openingTime: string; // '08:00'
  closingTime: string; // '18:00'
  indoor: boolean;
  outdoor: boolean;
  popularityScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  zone?: 'north' | 'south' | 'central' | 'east' | 'west';
}

export interface RecommendationScoreDetail {
  total: number; // 0 - 100
  preferenceMatch: number; // 30%
  budgetFit: number; // 20%
  distanceScore: number; // 15%
  popularity: number; // 10%
  weatherFit: number; // 10%
  timeFit: number; // 10%
  experience: number; // 5%
}

export interface DestinationScored {
  destination: DestinationEntity;
  score: RecommendationScoreDetail;
}

export interface WeatherDayForecast {
  date: string;
  tempC: number;
  tempDisplay: string;
  condition: 'sunny' | 'cloudy' | 'rain-light' | 'rain-heavy';
  rainChance: number; // 0 - 100
  humidity: number;
  icon: string;
  summary: string;
}

export interface RouteOptimizationResult {
  orderedDestinations: DestinationEntity[];
  totalDistanceKm: number;
  totalTravelTimeMinutes: number;
  legTravelTimes: number[];
  warning?: string;
}

export interface BudgetCalculationResult {
  breakdown: BudgetBreakdown;
  healthScore: number; // 0 - 100
  isOverBudget: boolean;
  overAmount: number;
  utilizationPercentage: number;
  warnings: string[];
  savingTips: {
    id: string;
    text: string;
    amount: number;
    actionLabel: string;
  }[];
}

export interface GenerateTripRequest {
  destination: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  travelers?: number;
  budget?: number;
  travelStyle?: TravelStyle;
  pace?: PaceType;
  preferences?: Partial<Record<ActivityPreference, RatingValue>>;
  transport?: TransportType;
  accommodation?: AccommodationType;
}

export interface ChatModificationRequest {
  tripId: string;
  currentPlan: TripPlan;
  message: string;
  history?: ChatMessage[];
}

export interface ChatModificationResponse {
  replyText: string;
  actionApplied?: string;
  updatedPlan: TripPlan;
}
