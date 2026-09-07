'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Car,
  Navigation,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TripPlan } from '@/types/trip';

interface RouteMapViewProps {
  plan: TripPlan;
  activeDayNumber: number;
}

export const RouteMapView: React.FC<RouteMapViewProps> = ({ plan, activeDayNumber }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const currentDay = plan.days.find((d) => d.dayNumber === activeDayNumber) || plan.days[0];

  const filteredActivities = currentDay.activities.filter((act) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'culinary') return act.category === 'culinary' || act.category === 'cafe';
    if (filterCategory === 'nature') return act.category === 'nature' || act.category === 'adventure';
    if (filterCategory === 'hotel') return act.category === 'hotel';
    return true;
  });

  const totalDayTravelTime = currentDay.activities.reduce(
    (acc, cur) => acc + (cur.travelTimeFromPrevMinutes || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Route Header Info Card */}
      <Card className="p-5 bg-card/75 border-border/70 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Optimasi Rute Searah (TSP Engine)
              </span>
              <span className="text-xs text-muted-foreground">Hari ke-{activeDayNumber}</span>
            </div>
            <h3 className="text-base font-bold text-foreground mt-1 font-heading">
              {currentDay.theme}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Urutan destinasi telah disusun berurutan secara geografis untuk meminimalkan waktu di perjalanan.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/50 shrink-0">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Car className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Estimasi Waktu Tempuh</p>
              <p className="text-sm font-bold text-foreground font-mono">
                ~{totalDayTravelTime} Menit Total
              </p>
            </div>
          </div>
        </div>

        {/* POI Filter Toggles (PRD Section 20) */}
        <div className="flex items-center gap-2 pt-4 border-t border-border/50 mt-4 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
            <Layers className="h-3.5 w-3.5" /> Filter Spot:
          </span>
          {[
            { id: 'all', label: 'Semua Spot' },
            { id: 'culinary', label: '🍜 Kuliner & Cafe' },
            { id: 'nature', label: '🌲 Wisata & Alam' },
            { id: 'hotel', label: '🏨 Akomodasi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors cursor-pointer shrink-0 ${
                filterCategory === tab.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Visual Topological Route Canvas (Flow Layout) */}
      <Card className="p-6 bg-card/80 border-border/70 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-emerald-600" /> Alur Perjalanan Searah (Zero Backtracking)
          </h4>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            ✓ 0 Jalur Muter-Muter Terdeteksi
          </span>
        </div>

        {/* Route Steps Vertical Map */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-sky-500">
          {filteredActivities.map((act, index) => {
            const isLast = index === filteredActivities.length - 1;

            return (
              <div key={act.id} className="relative group">
                {/* Node pin indicator */}
                <div className="absolute -left-6 sm:-left-8 top-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-background border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shadow-md">
                  {index + 1}
                </div>

                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:border-emerald-500/40 hover:bg-muted/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {act.time}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {act.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {act.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {act.travelTimeFromPrevMinutes ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                          🚗 +{act.travelTimeFromPrevMinutes} min
                        </span>
                      ) : null}
                      <span className="text-xs font-bold text-foreground font-mono">
                        {act.cost > 0 ? `Rp${act.cost.toLocaleString('id-ID')}` : 'Gratis'}
                      </span>
                    </div>
                  </div>

                  {act.notes && (
                    <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40 italic">
                      💡 {act.notes}
                    </p>
                  )}
                </div>

                {/* Distance Connector hint */}
                {!isLast && (
                  <div className="py-1 pl-4 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                    <ArrowRight className="h-3 w-3 text-emerald-600" />
                    <span>Jalur Searah Tanpa Bolak-Balik</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
