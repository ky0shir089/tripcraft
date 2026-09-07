import { TripPlan } from '@/types/trip';
import { bandungTripPlan } from '@/data/mockTrips';

export class TripRepository {
  // ponytail: in-memory map for zero-dependency persistence, swap to Drizzle/Postgres when DB env provided
  private store: Map<string, TripPlan> = new Map();

  constructor() {
    // Seed with initial Bandung trip
    if (bandungTripPlan && bandungTripPlan.id) {
      this.store.set(bandungTripPlan.id, bandungTripPlan);
    }
  }

  public async create(plan: TripPlan): Promise<TripPlan> {
    const id = plan.id || `trip-${Date.now()}`;
    const saved: TripPlan = { ...plan, id };
    this.store.set(id, saved);
    return saved;
  }

  public async findById(id: string): Promise<TripPlan | null> {
    return this.store.get(id) ?? null;
  }

  public async list(): Promise<TripPlan[]> {
    return Array.from(this.store.values());
  }

  public async update(id: string, updateData: Partial<TripPlan>): Promise<TripPlan | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const merged: TripPlan = {
      ...existing,
      ...updateData,
    };
    this.store.set(id, merged);
    return merged;
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export const tripRepository = new TripRepository();
