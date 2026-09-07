import { DESTINATIONS_DATA } from '../data/destinations';
import { DestinationEntity, DestinationScored } from '../types';
import { calculateDestinationScore } from '../engines/scoring';
import { ActivityPreference, RatingValue } from '@/types/trip';

export interface DestinationQueryFilter {
  city?: string;
  category?: string;
  preferenceCategory?: ActivityPreference;
  indoorOnly?: boolean;
  outdoorOnly?: boolean;
  maxCost?: number;
  limit?: number;
}

export class DestinationRepository {
  private destinations: DestinationEntity[] = [...DESTINATIONS_DATA];

  // List destinations matching filter criteria
  public find(filter: DestinationQueryFilter = {}): DestinationEntity[] {
    let list = this.destinations;

    if (filter.city) {
      const targetCity = filter.city.trim().toLowerCase();
      list = list.filter((d) => {
        const c = d.city.toLowerCase();
        if (c === targetCity) return true;
        if (c.includes(targetCity) || targetCity.includes(c)) return true;
        // Aliases
        if ((targetCity.includes('jogja') || targetCity.includes('yogya')) && c.includes('yogyakarta')) return true;
        if ((targetCity.includes('malang') || targetCity.includes('bromo') || targetCity.includes('batu')) && c.includes('malang')) return true;
        if (targetCity.includes('lombok') && c.includes('lombok')) return true;
        if (targetCity.includes('bali') && c.includes('bali')) return true;
        if (targetCity.includes('bandung') && c.includes('bandung')) return true;
        if (targetCity.includes('jakarta') && c.includes('jakarta')) return true;
        if ((targetCity.includes('surabaya') || targetCity.includes('sby')) && c.includes('surabaya')) return true;
        if (targetCity.includes('semarang') && c.includes('semarang')) return true;
        if ((targetCity.includes('solo') || targetCity.includes('surakarta')) && c.includes('solo')) return true;
        if (targetCity.includes('bogor') && c.includes('bogor')) return true;
        return false;
      });
    }

    if (filter.category) {
      list = list.filter((d) => d.category === filter.category);
    }

    if (filter.preferenceCategory) {
      list = list.filter((d) => d.preferenceCategory === filter.preferenceCategory);
    }

    if (filter.indoorOnly) {
      list = list.filter((d) => d.indoor);
    }

    if (filter.outdoorOnly) {
      list = list.filter((d) => d.outdoor);
    }

    if (typeof filter.maxCost === 'number') {
      list = list.filter((d) => d.estimatedCost <= filter.maxCost!);
    }

    if (filter.limit && filter.limit > 0) {
      list = list.slice(0, filter.limit);
    }

    return list;
  }

  // Get destination by ID
  public findById(id: string): DestinationEntity | null {
    return this.destinations.find((d) => d.id === id) ?? null;
  }

  // PRD Section 16 & 17 Destination Recommendation with Weighted Scoring
  public recommend(
    city: string,
    preferences: Partial<Record<ActivityPreference, RatingValue>> = {},
    budgetPerActivity: number = 100000,
    isRaining: boolean = false,
    limit: number = 10
  ): DestinationScored[] {
    const pool = this.find({ city });

    const scoredList: DestinationScored[] = pool.map((dest) => {
      const score = calculateDestinationScore(
        dest,
        preferences,
        budgetPerActivity,
        5, // default km from center
        isRaining
      );
      return { destination: dest, score };
    });

    // Sort descending by total weighted score
    scoredList.sort((a, b) => b.score.total - a.score.total);

    return scoredList.slice(0, limit);
  }
}

export const destinationRepository = new DestinationRepository();
