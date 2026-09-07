export type TravelStyle = 'budget' | 'backpacker' | 'balanced' | 'comfort' | 'luxury';

export type PaceType = 'relaxed' | 'balanced' | 'packed';

export type ActivityPreference =
  | 'kuliner'
  | 'alam'
  | 'pantai'
  | 'budaya'
  | 'sejarah'
  | 'shopping'
  | 'nightlife'
  | 'adventure'
  | 'family'
  | 'religi'
  | 'photography';

export type RatingValue = 'love' | 'like' | 'neutral' | 'dislike' | 'avoid';

export type TransportType = 'car' | 'driver' | 'motorcycle' | 'public';

export type AccommodationType = 'boutique' | 'star34' | 'resort' | 'villa' | 'hostel';

export interface TripConfig {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: number;
  budget: number;
  travelStyle: TravelStyle;
  pace: PaceType;
  preferences: Record<ActivityPreference, RatingValue>;
  transport: TransportType;
  accommodation: AccommodationType;
}

export interface ActivityItem {
  id: string;
  time: string;
  title: string;
  location: string;
  category: 'culinary' | 'nature' | 'culture' | 'hotel' | 'cafe' | 'transit' | 'shopping' | 'adventure';
  durationMinutes: number;
  travelTimeFromPrevMinutes?: number;
  cost: number;
  isOutdoor: boolean;
  weatherCondition: 'sunny' | 'cloudy' | 'rain-light' | 'rain-heavy';
  weatherWarning?: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
}

export interface DayItinerary {
  dayNumber: number;
  dateStr: string;
  theme: string;
  weatherSummary: {
    temp: string;
    condition: string;
    rainChance: number;
    icon: string;
  };
  warning?: string;
  activities: ActivityItem[];
}

export interface BudgetBreakdown {
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  shopping: number;
  emergencyBuffer: number;
  totalEstimated: number;
}

export interface AlternativeScenario {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  totalCost: number;
  hotelClass: string;
  transportMode: string;
  activityCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  actionApplied?: string;
}

export interface TripPlan {
  id: string;
  title: string;
  destination: string;
  durationText: string;
  travelers: number;
  budgetTotal: number;
  travelStyle: TravelStyle;
  pace: PaceType;
  overallHealthScore: number;
  days: DayItinerary[];
  budget: BudgetBreakdown;
  alternatives: AlternativeScenario[];
  savingsTips: {
    id: string;
    text: string;
    amount: number;
    actionLabel: string;
  }[];
}
