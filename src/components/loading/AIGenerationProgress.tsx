'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  MapPin,
  Route,
  Calculator,
  CloudSun,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AIGenerationProgressProps {
  destination: string;
  budget: number;
  durationDays: number;
  travelers: number;
  isReady?: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Menganalisis Preferensi & Parameter',
    desc: 'Memetakan minat kuliner, alam, gaya santai & batasan budget.',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Mencari Kandidat Destinasi & Restoran Lokal',
    desc: 'Mengambil POI terverifikasi, jam buka & harga tiket terkini.',
    icon: MapPin,
  },
  {
    id: 3,
    title: 'Mengoptimalkan Urutan Rute (TSP Engine)',
    desc: 'Menghindari perjalanan bolak-balik, memangkas waktu tempuh jalan.',
    icon: Route,
  },
  {
    id: 4,
    title: 'Mengecek Prakiraan Cuaca & Kondisi Lapangan',
    desc: 'Menyusun opsi indoor / outdoor sesuai kemungkinan hujan harian.',
    icon: CloudSun,
  },
  {
    id: 5,
    title: 'Finalisasi Alokasi Anggaran & Jadwal Realistis',
    desc: 'Menghitung buffer darurat, biaya BBM, makan & tiket masuk.',
    icon: Calculator,
  },
];

export const AIGenerationProgress: React.FC<AIGenerationProgressProps> = ({
  destination,
  budget,
  durationDays,
  travelers,
  isReady,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const onCompleteRef = React.useRef(onComplete);
  const isReadyRef = React.useRef(isReady);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    isReadyRef.current = isReady;
  }, [onComplete, isReady]);

  const isFinished = isReady && progress >= 60;
  const activeProgress = isFinished ? 100 : progress;
  const activeStepIndex = isFinished ? STEPS.length - 1 : currentStepIndex;

  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount += 1;

      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });

      setProgress((prev) => {
        // If ready from API, jump straight to completion
        if (isReadyRef.current || tickCount >= 8) {
          clearInterval(interval);
          setTimeout(() => {
            onCompleteRef.current();
          }, 350);
          return 100;
        }

        // Wait slightly at step 5 if API is still generating
        if (prev >= 85) {
          return Math.min(prev + 4, 96);
        }

        return prev + 18;
      });
    }, 550);

    return () => clearInterval(interval);
  }, []);

  // When isReady becomes true while waiting at high progress
  useEffect(() => {
    if (isReady && progress >= 60) {
      const timer = setTimeout(() => {
        onCompleteRef.current();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isReady, progress]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="p-6 sm:p-8 bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 text-white items-center justify-center shadow-lg shadow-emerald-600/20">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                TripCraft Sedang Menyusun Rencana...
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Menyiapkan itinerary realistis untuk{' '}
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {destination} ({durationDays} Hari, {travelers} Orang, Budget {formatRupiah(budget)})
                </span>
              </p>
            </div>

            <div className="pt-2">
              <Progress value={activeProgress} className="h-2 bg-muted rounded-full" />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-mono">
                <span>Memproses algoritma...</span>
                <span>{activeProgress}%</span>
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3.5">
            {STEPS.map((step, idx) => {
              const isDone = idx < activeStepIndex || activeProgress >= 100;
              const isCurrent = idx === activeStepIndex && activeProgress < 100;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : isDone
                      ? 'bg-muted/30 border border-transparent'
                      : 'opacity-40 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
                        {step.id}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-emerald-950 dark:text-emerald-100 font-bold'
                            : isDone
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-medium animate-pulse">
                          Proses
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
