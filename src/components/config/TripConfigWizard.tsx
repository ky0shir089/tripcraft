'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Compass,
  Sparkles,
  Car,
  Hotel,
  Gauge,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Ban,
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  TripConfig,
  TravelStyle,
  PaceType,
  ActivityPreference,
  RatingValue,
  TransportType,
  AccommodationType,
} from '@/types/trip';

interface TripConfigWizardProps {
  initialCity?: string;
  initialBudget?: number;
  initialDays?: number;
  initialTravelers?: number;
  initialTravelStyle?: TravelStyle;
  initialPace?: PaceType;
  isOpen: boolean;
  onClose: () => void;
  onGenerateTrip: (config: TripConfig) => void;
}

const ACTIVITY_LIST: { id: ActivityPreference; label: string; desc: string }[] = [
  { id: 'kuliner', label: 'Kuliner', desc: 'Makanan legendaris, street food & cafe lokal' },
  { id: 'alam', label: 'Alam & Pemandangan', desc: 'Kawah, danau, perbukitan & hutan pinus' },
  { id: 'budaya', label: 'Budaya & Seni', desc: 'Pertunjukan seni, desa adat, dan sanggar' },
  { id: 'sejarah', label: 'Sejarah & Heritage', desc: 'Museum, bangunan kolonial & cagar budaya' },
  { id: 'pantai', label: 'Pantai & Bahari', desc: 'Pesisir, sunset, dan aktivitas air' },
  { id: 'shopping', label: 'Shopping & Belanja', desc: 'Sentra oleh-oleh, kerajinan & factory outlet' },
  { id: 'photography', label: 'Spot Foto Estetik', desc: 'Arsitektur, lanskap & tempat instagramable' },
  { id: 'family', label: 'Aktivitas Ramah Keluarga', desc: 'Taman hiburan, peternakan & edukasi wisata' },
  { id: 'adventure', label: 'Petualangan & Trekking', desc: 'Offroad jeep, arung jeram & hiking gunung' },
  { id: 'religi', label: 'Religi & Spiritual', desc: 'Masjid agung, pura, gereja & situs ziarah' },
  { id: 'nightlife', label: 'Nightlife & Hangout', desc: 'Pasar malam, live music & lounge' },
];

const RATING_OPTIONS: { value: RatingValue; icon: React.ReactNode; label: string; color: string }[] = [
  { value: 'love', icon: <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />, label: 'Sangat Suka', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
  { value: 'like', icon: <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />, label: 'Suka', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  { value: 'neutral', icon: <Meh className="h-3.5 w-3.5 text-amber-600" />, label: 'Netral', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  { value: 'dislike', icon: <ThumbsDown className="h-3.5 w-3.5 text-stone-500" />, label: 'Kurang Suka', color: 'text-stone-600 bg-stone-100 dark:bg-stone-800' },
  { value: 'avoid', icon: <Ban className="h-3.5 w-3.5 text-rose-600" />, label: 'Hindari', color: 'text-rose-700 bg-rose-100 dark:bg-rose-900/40' },
];

export const TripConfigWizard: React.FC<TripConfigWizardProps> = ({
  initialCity = 'Bandung',
  initialBudget = 3000000,
  initialDays = 3,
  initialTravelers = 2,
  initialTravelStyle = 'balanced',
  initialPace = 'balanced',
  isOpen,
  onClose,
  onGenerateTrip,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const cleanInitialCity = (initialCity || 'Bandung').split(',')[0].trim();

  // Form State
  const [destination, setDestination] = useState(cleanInitialCity);
  const [startDate, setStartDate] = useState('2026-09-18');
  const [durationDays, setDurationDays] = useState(initialDays);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [budget, setBudget] = useState(initialBudget);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(initialTravelStyle);
  const [pace, setPace] = useState<PaceType>(initialPace);
  const [transport, setTransport] = useState<TransportType>('car');
  const [accommodation, setAccommodation] = useState<AccommodationType>('star34');

  // Keep form state strictly synced with current data whenever modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setDestination((initialCity || 'Bandung').split(',')[0].trim());
      setDurationDays(initialDays);
      setTravelers(initialTravelers);
      setBudget(initialBudget);
      if (initialTravelStyle) setTravelStyle(initialTravelStyle);
      if (initialPace) setPace(initialPace);
      setCurrentStep(1);
    }
  }

  // Preferences Map
  const [preferences, setPreferences] = useState<Record<ActivityPreference, RatingValue>>({
    kuliner: 'love',
    alam: 'love',
    pantai: 'like',
    budaya: 'like',
    sejarah: 'neutral',
    shopping: 'like',
    photography: 'love',
    family: 'neutral',
    adventure: 'neutral',
    religi: 'neutral',
    nightlife: 'neutral',
  });

  if (!isOpen) return null;

  const handlePreferenceChange = (act: ActivityPreference, val: RatingValue) => {
    setPreferences((prev) => ({ ...prev, [act]: val }));
  };

  const handleComplete = () => {
    const config: TripConfig = {
      destination,
      startDate,
      endDate: startDate,
      durationDays,
      travelers,
      budget,
      travelStyle,
      pace,
      preferences,
      transport,
      accommodation,
    };
    onGenerateTrip(config);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Parameter Perjalanan TripCraft</h2>
              <p className="text-xs text-muted-foreground">Langkah {currentStep} dari 3 — Atur preferensi cerdasmu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-3 border-b border-border/50 text-xs font-semibold bg-muted/10">
          <div
            className={`py-2.5 px-4 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              currentStep === 1
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px]">1</span>
            Destinasi & Budget
          </div>
          <div
            className={`py-2.5 px-4 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              currentStep === 2
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px]">2</span>
            Gaya & Intensitas
          </div>
          <div
            className={`py-2.5 px-4 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              currentStep === 3
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px]">3</span>
            Preferensi Aktivitas
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* STEP 1: Basic Trip Configuration */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wiz-dest" className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Kota / Destinasi Tujuan
                  </Label>
                  <Input
                    id="wiz-dest"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Misal: Bandung, Yogyakarta, Bali"
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="wiz-startdate" className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-600" /> Tanggal Mulai Perjalanan
                  </Label>
                  <Input
                    id="wiz-startdate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wiz-duration" className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-sky-600" /> Durasi Wisata
                  </Label>
                  <select
                    id="wiz-duration"
                    aria-label="Pilih Durasi Wisata"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md bg-muted/40 border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={2}>2 Hari 1 Malam (2D1N)</option>
                    <option value={3}>3 Hari 2 Malam (3D2N) — Populer</option>
                    <option value={4}>4 Hari 3 Malam (4D3N)</option>
                    <option value={5}>5 Hari 4 Malam (5D4N)</option>
                    <option value={6}>6 Hari 5 Malam (6D5N)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="wiz-travelers" className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-600" /> Jumlah Wisatawan
                  </Label>
                  <select
                    id="wiz-travelers"
                    aria-label="Pilih Jumlah Wisatawan"
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md bg-muted/40 border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={1}>Solo Traveler (1 Orang)</option>
                    <option value={2}>2 Orang (Pasangan / Teman)</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang (Keluarga)</option>
                    <option value={5}>5 Orang</option>
                    <option value={6}>6+ Orang (Rombongan)</option>
                  </select>
                </div>
              </div>

              {/* Budget Slider */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wiz-budget" className="text-xs font-semibold flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-teal-600" /> Total Alokasi Anggaran
                  </Label>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatRupiah(budget)}
                  </span>
                </div>
                <Slider
                  id="wiz-budget"
                  value={[budget]}
                  onValueChange={(val) => setBudget(typeof val === 'number' ? val : val[0])}
                  min={1000000}
                  max={15000000}
                  step={250000}
                  className="py-1 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Rp 1.000.000 (Hemat)</span>
                  <span>Rp 7.500.000</span>
                  <span>Rp 15.000.000+ (Mewah)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Style, Pace, Transport, Accommodation */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Travel Style */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" /> Gaya Perjalanan (Travel Style)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'budget', label: 'Budget', desc: 'Fokus hemat' },
                      { id: 'backpacker', label: 'Backpacker', desc: 'Eksplorasi riil' },
                      { id: 'balanced', label: 'Balanced', desc: 'Nyaman & efisien' },
                      { id: 'comfort', label: 'Comfort', desc: 'Prioritas santai' },
                      { id: 'luxury', label: 'Luxury', desc: 'Resort & premium' },
                    ] as const
                  ).map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setTravelStyle(st.id)}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        travelStyle === st.id
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500'
                          : 'border-border/70 hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <p className="text-xs font-bold">{st.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace / Intensity (PRD Section 11) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-teal-600" /> Ritme & Intensitas (Pace)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      { id: 'relaxed', label: 'Santai (Relaxed)', desc: '2–4 aktivitas/hari, banyak waktu rehat & nongkrong santai' },
                      { id: 'balanced', label: 'Seimbang (Balanced)', desc: '4–6 aktivitas/hari, eksplorasi optimal tanpa terburu-buru' },
                      { id: 'packed', label: 'Padat (Packed)', desc: '6+ aktivitas/hari, maksimalkan seluruh tempat dalam waktu terbatas' },
                    ] as const
                  ).map((pc) => (
                    <button
                      type="button"
                      key={pc.id}
                      onClick={() => setPace(pc.id)}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        pace === pc.id
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 text-teal-950 dark:text-teal-100 shadow-xs ring-1 ring-teal-500'
                          : 'border-border/70 hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <p className="text-xs font-bold">{pc.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{pc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport & Hotel Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wiz-transport" className="text-xs font-semibold flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-sky-600" /> Moda Transportasi Utama
                  </Label>
                  <select
                    id="wiz-transport"
                    aria-label="Pilih Moda Transportasi"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value as TransportType)}
                    className="w-full h-10 px-3 rounded-md bg-muted/40 border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="car">Sewa Mobil Lepas Kunci</option>
                    <option value="driver">Sewa Mobil + Driver Lokal</option>
                    <option value="motorcycle">Sewa Sepeda Motor</option>
                    <option value="public">Transportasi Umum & Online</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wiz-accommodation" className="text-xs font-semibold flex items-center gap-1.5">
                    <Hotel className="h-3.5 w-3.5 text-amber-600" /> Tipe Penginapan
                  </Label>
                  <select
                    id="wiz-accommodation"
                    aria-label="Pilih Tipe Penginapan"
                    value={accommodation}
                    onChange={(e) => setAccommodation(e.target.value as AccommodationType)}
                    className="w-full h-10 px-3 rounded-md bg-muted/40 border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="star34">Hotel Bintang 3 - 4 (Kenyamanan Ideal)</option>
                    <option value="boutique">Boutique Hotel Estetik</option>
                    <option value="resort">Resort & Spa Alami</option>
                    <option value="villa">Private Villa</option>
                    <option value="hostel">Guesthouse / Homestay Hemat</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Activity Preferences with 5 Rating Levels (PRD Section 7) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                💡 <strong>Skor Minat AI:</strong> Beri rating untuk setiap kategori agar algoritma TripCraft memilihkan destinasi yang benar-benar kamu nikmati.
              </div>

              <div className="space-y-3">
                {ACTIVITY_LIST.map((act) => {
                  const currentVal = preferences[act.id] || 'neutral';
                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{act.label}</p>
                        <p className="text-[11px] text-muted-foreground">{act.desc}</p>
                      </div>

                      {/* 5-button rating selector */}
                      <div className="flex items-center gap-1">
                        {RATING_OPTIONS.map((opt) => {
                          const isSelected = currentVal === opt.value;
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => handlePreferenceChange(act.id, opt.value)}
                              title={opt.label}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? `${opt.color} border-current ring-1 ring-current shadow-xs`
                                  : 'border-transparent text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              {opt.icon}
                              <span className="hidden md:inline text-[10px]">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
          <div>
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
                Batal
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Selanjutnya <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold cursor-pointer shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                Mulai Susun Itinerary AI
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
