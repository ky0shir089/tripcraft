'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Navigation,
  CloudSun,
  ChevronRight,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { popularDestinations } from '@/data/mockTrips';

interface LandingHeroProps {
  onQuickGenerate: (destination: string, budget: number, durationDays: number, travelers: number) => void;
  onOpenDetailedWizard: (initialCity?: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onQuickGenerate,
  onOpenDetailedWizard,
}) => {
  const [destination, setDestination] = useState('Bandung');
  const [budget, setBudget] = useState(3000000);
  const [durationDays, setDurationDays] = useState(3);
  const [travelers, setTravelers] = useState(2);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickGenerate(destination, budget, durationDays, travelers);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden pt-6 pb-16 lg:pt-12 lg:pb-24">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-400/20" />
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-teal-400/20" />
        <div className="absolute -top-10 left-1/3 w-96 h-96 rounded-full bg-sky-400/15" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Tag & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Travel Companion Realistis & Anti Ribet</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-heading leading-tight">
            Liburan Impian, Jadwal Realistis,{' '}
            <span className="text-emerald-700 dark:text-emerald-400">
              Nggak Bikin Capek.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            TripCraft menyusun itinerary harian dengan memperhitungkan jarak tempuh searah,
            estimasi anggaran akurat, dan adaptasi prakiraan cuaca lokal Indonesia.
          </p>
        </div>

        {/* Quick Plan Input Card (PRD Screen 1) */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="p-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-sky-500/30 shadow-xl backdrop-blur-xl">
            <Card className="border-0 bg-background/90 backdrop-blur-xl p-5 sm:p-7 rounded-[14px]">
              <form onSubmit={handleQuickSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Destination */}
                  <div className="space-y-2">
                    <Label htmlFor="destination-input" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Mau Liburan ke Mana?
                    </Label>
                    <div className="relative">
                      <Input
                        id="destination-input"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Contoh: Bandung, Jogja, Bali"
                        className="h-11 font-medium bg-muted/40 border-border/70 focus-visible:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget-input" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-teal-600" /> Total Budget (Rp)
                    </Label>
                    <div className="relative">
                      <Input
                        id="budget-input"
                        type="number"
                        step={100000}
                        min={500000}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="h-11 font-medium bg-muted/40 border-border/70 focus-visible:ring-teal-500"
                        required
                      />
                      <span className="absolute right-3 top-3 text-[11px] text-muted-foreground font-mono">
                        {formatRupiah(budget)}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration-select" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-sky-600" /> Durasi
                    </Label>
                    <select
                      id="duration-select"
                      aria-label="Durasi Perjalanan"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-md bg-muted/40 border border-border/70 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-foreground cursor-pointer"
                    >
                      <option value={2}>2 Hari 1 Malam (2D1N)</option>
                      <option value={3}>3 Hari 2 Malam (3D2N)</option>
                      <option value={4}>4 Hari 3 Malam (4D3N)</option>
                      <option value={5}>5 Hari 4 Malam (5D4N)</option>
                    </select>
                  </div>

                  {/* Travelers */}
                  <div className="space-y-2">
                    <Label htmlFor="travelers-select" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-600" /> Wisatawan
                    </Label>
                    <select
                      id="travelers-select"
                      aria-label="Jumlah Wisatawan"
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-md bg-muted/40 border border-border/70 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground cursor-pointer"
                    >
                      <option value={1}>Solo Traveler (1 Orang)</option>
                      <option value={2}>Pasangan / Teman (2 Orang)</option>
                      <option value={4}>Keluarga Kecil (3 - 4 Orang)</option>
                      <option value={6}>Rombongan / Grup (5 - 6 Orang)</option>
                    </select>
                  </div>
                </div>

                {/* Submit row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Algoritma cerdas rute efisien + estimasi biaya transparan</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenDetailedWizard(destination)}
                      className="gap-1.5 h-11 px-4 text-xs font-medium w-full sm:w-auto cursor-pointer"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      Detail Preferensi
                    </Button>

                    <Button
                      type="submit"
                      className="gap-2 h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md w-full sm:w-auto cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Buat Itinerary Sekarang</span>
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* 3 Core Value Propositions (PRD Section 34) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/60 hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mb-4">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>Budget-Aware</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                Transparan
              </span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Liburan sesuai kemampuan. AI membagi alokasi akomodasi, bensin, tiket masuk, hingga cadangan darurat tanpa biaya tak terduga.
            </p>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/60 hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center mb-4">
              <Navigation className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>Route-Aware</span>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 font-semibold">
                Nggak Muter-Muter
              </span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Mengoptimalkan urutan kunjungan dengan pemodelan jarak realistis. Menghindari bolak-balik antara utara dan selatan kota yang bikin habis waktu di jalan.
            </p>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/60 hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center mb-4">
              <CloudSun className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>Context-Aware</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 font-semibold">
                Adaptif Cuaca
              </span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Menyesuaikan rekomendasi dengan prakiraan cuaca, jam operasional tempat, serta intensitas waktu istirahat agar liburan tetap nyaman.
            </p>
          </Card>
        </div>

        {/* Popular Destinations Showcase */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground font-heading">
                Destinasi Favorit Indonesia
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pilih langsung kota tujuan untuk menguji coba itinerary rekomendasi AI
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenDetailedWizard(destination)}
              className="text-xs gap-1 text-emerald-700 dark:text-emerald-400 cursor-pointer"
            >
              Kustomisasi Bebas <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {popularDestinations.map((dest) => (
              <div
                key={dest.name}
                onClick={() => {
                  setDestination(dest.name);
                  setDurationDays(dest.durationDef);
                  onQuickGenerate(dest.name, budget, dest.durationDef, travelers);
                }}
                className="group relative rounded-xl overflow-hidden cursor-pointer border border-border/60 bg-card hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`h-24 bg-gradient-to-br ${dest.gradient} p-3 flex flex-col justify-between text-white`}>
                  <span className="text-[10px] font-medium bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full w-fit">
                    {dest.durationDef}D{dest.durationDef - 1}N
                  </span>
                  <div>
                    <h3 className="text-base font-bold drop-shadow-xs">{dest.name}</h3>
                    <p className="text-[11px] text-white/80">{dest.province}</p>
                  </div>
                </div>
                <div className="p-3 bg-card">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {dest.tag}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Estimasi {dest.budgetAvg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
