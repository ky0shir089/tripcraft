import { ActivityPreference, RatingValue } from '@/types/trip';
import { DestinationEntity, RecommendationScoreDetail } from '../types';

const RATING_WEIGHTS: Record<RatingValue, number> = {
  love: 100,
  like: 80,
  neutral: 50,
  dislike: 20,
  avoid: 0,
};

// PRD Section 17 Recommendation Scoring
// Score = Preference Match * 30% + Budget Fit * 20% + Distance * 15% + Popularity * 10% + Weather Fit * 10% + Time Fit * 10% + Experience * 5%
export function calculateDestinationScore(
  destination: DestinationEntity,
  preferences: Partial<Record<ActivityPreference, RatingValue>> = {},
  budgetPerActivity: number = 100000,
  distanceKmFromCenter: number = 5,
  isRaining: boolean = false
): RecommendationScoreDetail {
  // 1. Preference Match (30%)
  const userRating = preferences[destination.preferenceCategory] ?? 'neutral';
  const preferenceMatch = RATING_WEIGHTS[userRating];

  // 2. Budget Fit (20%)
  // ponytail: linear ratio clamp, replace with nonlinear elasticity when price tiers expand
  let budgetFit = 100;
  if (destination.estimatedCost > budgetPerActivity * 1.5) {
    budgetFit = 30;
  } else if (destination.estimatedCost > budgetPerActivity) {
    budgetFit = 65;
  } else if (destination.estimatedCost === 0) {
    budgetFit = 100;
  } else {
    budgetFit = 95;
  }

  // 3. Distance Score (15%)
  // Closer to city center or previous stop is better (0-30km range)
  const clampedDistance = Math.max(0, Math.min(30, distanceKmFromCenter));
  const distanceScore = Math.round(100 - (clampedDistance / 30) * 80);

  // 4. Popularity (10%)
  const popularity = destination.popularityScore ?? 75;

  // 5. Weather Fit (10%)
  let weatherFit = 90;
  if (isRaining) {
    weatherFit = destination.indoor ? 95 : 25;
  } else {
    weatherFit = destination.outdoor ? 95 : 85;
  }

  // 6. Time Fit (10%)
  // If destination duration fits in standard daylight/evening schedule
  const timeFit = destination.estimatedDurationMinutes <= 180 ? 95 : 70;

  // 7. Experience Score (5%)
  const experience = destination.experienceScore ?? 80;

  const total = Math.round(
    preferenceMatch * 0.3 +
      budgetFit * 0.2 +
      distanceScore * 0.15 +
      popularity * 0.1 +
      weatherFit * 0.1 +
      timeFit * 0.1 +
      experience * 0.05
  );

  return {
    total,
    preferenceMatch,
    budgetFit,
    distanceScore,
    popularity,
    weatherFit,
    timeFit,
    experience,
  };
}
