'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CloudSun,
  CloudRain,
  Sun,
  AlertTriangle,
  Sliders,
  Bot,
  Map as MapIcon,
  PieChart,
  CheckCircle2,
  Bookmark,
  X,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TripPlan } from '@/types/trip';
import { BudgetBreakdownView } from '@/components/budget/BudgetBreakdownView';
import { RouteMapView } from '@/components/itinerary/RouteMapView';
import { TripChatbot } from '@/components/chat/TripChatbot';

interface ItineraryViewProps {
  plan: TripPlan;
  onEditConfig: () => void;
  onUpdatePlan: (updatedPlan: TripPlan) => void;
  onResetToLanding: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  plan,
  onEditConfig,
  onUpdatePlan,
  onResetToLanding,
}) => {
  const [activeDayNumber, setActiveDayNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<'timeline' | 'budget' | 'map' | 'chat'>('timeline');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [chatUpdateToast, setChatUpdateToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentActiveDayNumber = plan.days.some((d) => d.dayNumber === activeDayNumber)
    ? activeDayNumber
    : (plan.days[0]?.dayNumber ?? 1);
  const activeDay = plan.days.find((d) => d.dayNumber === currentActiveDayNumber) || plan.days[0];
  const isWithinBudget = plan.budget.totalEstimated <= plan.budgetTotal;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch (err) {
      console.error('Failed to save trip:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // AI Chat modifications callback handler
  const handleModifyItinerary = (actionKey: string, promptText: string) => {
    const cloned = JSON.parse(JSON.stringify(plan)) as TripPlan;
    const destinationCity = (cloned.destination || 'Bandung').split(',')[0].trim();
    let modified = false;

    if (actionKey === 'seafood' || actionKey === 'add_culinary_stop') {
      const targetDay = cloned.days[1] || cloned.days[0];
      if (targetDay) {
        targetDay.activities.push({
          id: `act-seafood-${Date.now()}`,
          time: '20:30',
          title: `Makan Malam Seafood Rekomendasi: Pilihan Kuliner ${destinationCity}`,
          location: `Area Kuliner & Restoran, ${destinationCity}`,
          category: 'culinary',
          durationMinutes: 75,
          travelTimeFromPrevMinutes: 15,
          cost: 140000,
          isOutdoor: false,
          weatherCondition: 'cloudy',
          notes: `Kepiting dan hidangan laut lokal ${destinationCity} satu jalur kembali ke penginapan.`,
        });
        cloned.budget.food += 140000;
        cloned.budget.totalEstimated += 140000;
        modified = true;
      }
    } else if (actionKey === 'coffee' || actionKey === 'add_coffee_stop') {
      const targetDay = cloned.days[1] || cloned.days[0];
      if (targetDay) {
        targetDay.activities.push({
          id: `act-coffee-${Date.now()}`,
          time: '17:00',
          title: `Coffee Break Senja: Cafe Pilihan ${destinationCity}`,
          location: `Kawasan Cafe & Coffee Shop, ${destinationCity}`,
          category: 'cafe',
          durationMinutes: 50,
          travelTimeFromPrevMinutes: 15,
          cost: 45000,
          isOutdoor: false,
          weatherCondition: 'sunny',
          notes: `Kopi khas lokal dan kudapan santai senja di ${destinationCity} sebelum makan malam.`,
        });
        cloned.budget.food += 45000;
        cloned.budget.totalEstimated += 45000;
        modified = true;
      }
    } else if (actionKey === 'rain_indoor' || actionKey === 'switch_to_indoor') {
      const targetDay = cloned.days[1] || cloned.days[0];
      if (targetDay) {
        targetDay.activities.push({
          id: `act-indoor-${Date.now()}`,
          time: '14:00',
          title: `Opsi Indoor Hujan: Destinasi Edukasi & Budaya ${destinationCity}`,
          location: `Pusat Edukasi & Budaya Indoor, ${destinationCity}`,
          category: 'culture',
          durationMinutes: 75,
          travelTimeFromPrevMinutes: 20,
          cost: 15000,
          isOutdoor: false,
          weatherCondition: 'rain-light',
          notes: `Alternatif indoor edukatif ber-AC di ${destinationCity} jika terjadi hujan deras.`,
        });
        targetDay.warning = 'Opsi indoor alternatif disiapkan untuk antisipasi hujan lebat.';
        cloned.budget.activities += 15000;
        cloned.budget.totalEstimated += 15000;
        modified = true;
      }
    } else if (actionKey === 'cheaper_hotel' || actionKey === 'adjust_hotel_budget') {
      const savedAmount = 250000;
      cloned.budget.accommodation = Math.max(0, cloned.budget.accommodation - savedAmount);
      cloned.budget.emergencyBuffer += savedAmount;
      modified = true;
    } else if (actionKey === 'relaxed' || actionKey === 'set_relaxed_pace') {
      cloned.pace = 'relaxed';
      cloned.days.forEach((d) => {
        if (d.activities.length > 4) {
          d.activities = d.activities.slice(0, 4);
        }
        d.warning = undefined;
      });
      modified = true;
    } else if (actionKey === 'add_custom_activity' || actionKey === 'custom') {
      const targetDay = cloned.days[1] || cloned.days[0];
      if (targetDay) {
        targetDay.activities.push({
          id: `act-custom-${Date.now()}`,
          time: '16:00',
          title: `Rekomendasi AI: Sentra Oleh-Oleh & Wisata Lokal`,
          location: `Area Komersil Terkurasi, ${destinationCity}`,
          category: 'shopping',
          durationMinutes: 60,
          travelTimeFromPrevMinutes: 15,
          cost: 50000,
          isOutdoor: false,
          weatherCondition: 'cloudy',
          notes: `Destinasi tambahan dari catatan chatbot: ${promptText}`,
        });
        cloned.budget.shopping += 50000;
        cloned.budget.totalEstimated += 50000;
        modified = true;
      }
    }

    if (modified) {
      cloned.budget.totalEstimated =
        cloned.budget.accommodation +
        cloned.budget.transportation +
        cloned.budget.food +
        cloned.budget.activities +
        cloned.budget.shopping +
        cloned.budget.emergencyBuffer;
      cloned.overallHealthScore = cloned.budget.totalEstimated <= cloned.budgetTotal
        ? Math.min(98, Math.max(75, Math.round((cloned.budget.totalEstimated / (cloned.budgetTotal || 1)) * 100)))
        : Math.max(40, 90 - Math.round(((cloned.budget.totalEstimated - cloned.budgetTotal) / (cloned.budgetTotal || 1)) * 100));
      onUpdatePlan(cloned);
      setChatUpdateToast('Rencana perjalanan berhasil diperbarui oleh AI!');
      setTimeout(() => setChatUpdateToast(null), 3500);
    }
  };

  const getWeatherIcon = (iconStr: string) => {
    switch (iconStr) {
      case 'CloudRain':
        return <CloudRain className="h-4 w-4 text-sky-500" />;
      case 'Sun':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'SunCloud':
      default:
        return <CloudSun className="h-4 w-4 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Save Alert */}
      {savedNotification && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-xs font-semibold">Rencana perjalanan berhasil disimpan ke browser!</p>
        </div>
      )}

      {/* Toast Chat Update Alert */}
      {chatUpdateToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-xs font-semibold">{chatUpdateToast}</p>
        </div>
      )}

      {/* Header Itinerary Banner (PRD Section 19) */}
      <div className="relative rounded-2xl overflow-hidden border border-border/70 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Itinerary Terverifikasi AI
              </span>
              <span className="text-xs text-white/70">
                {plan.durationText} · {plan.travelers} Wisatawan
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/90">
                Pace: {(plan.pace || 'balanced').toUpperCase()}
              </span>
              {plan.travelStyle && (
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/90">
                  Gaya: {plan.travelStyle.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {plan.destination}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {plan.title} — Rute dioptimasi searah tanpa bolak-balik, estimasi biaya transparan, dan disesuaikan dengan kondisi cuaca.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
              <p className="text-[10px] uppercase font-bold text-white/60">Alokasi Budget</p>
              <p className="text-lg font-bold font-mono text-white">
                {formatRupiah(plan.budgetTotal)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
              <p className="text-[10px] uppercase font-bold text-white/60">Estimasi Realistis</p>
              <p className={`text-lg font-bold font-mono ${isWithinBudget ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatRupiah(plan.budget.totalEstimated)}
              </p>
            </div>

            <div
              className={`backdrop-blur-md px-4 py-3 rounded-xl border ${
                isWithinBudget
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-[10px] uppercase font-bold ${
                    isWithinBudget ? 'text-emerald-300/70' : 'text-rose-300/70'
                  }`}
                >
                  Status
                </p>
                {plan.overallHealthScore !== undefined && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                    Skor {plan.overallHealthScore}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold flex items-center gap-1 mt-0.5">
                {isWithinBudget ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Within Budget
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" /> Over Budget
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetToLanding}
              className="h-8 gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Buat Rute Baru
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEditConfig}
              className="h-8 gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              Edit Parameter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveTrip}
              disabled={isSaving}
              className="h-8 gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer disabled:opacity-50"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {isSaving ? 'Menyimpan...' : 'Simpan Rencana'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsChatDrawerOpen(true)}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              <Bot className="h-3.5 w-3.5" />
              Tanya / Modifikasi AI
            </Button>
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="timeline"
              className="gap-2 text-xs font-semibold px-4 cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              Jadwal Harian
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="gap-2 text-xs font-semibold px-4 cursor-pointer"
            >
              <PieChart className="h-3.5 w-3.5" />
              Rincian Anggaran
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="gap-2 text-xs font-semibold px-4 cursor-pointer"
            >
              <MapIcon className="h-3.5 w-3.5" />
              Peta & Rute Searah
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="gap-2 text-xs font-semibold px-4 cursor-pointer"
            >
              <Bot className="h-3.5 w-3.5" />
              Chatbot AI
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Daily Timeline (PRD Section 19) */}
        <TabsContent value="timeline" className="space-y-6 outline-none">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {plan.days.map((d) => {
              const isSelected = d.dayNumber === currentActiveDayNumber;
              return (
                <button
                  key={d.dayNumber}
                  onClick={() => setActiveDayNumber(d.dayNumber)}
                  className={`p-3 rounded-xl border text-left transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500 text-emerald-950 dark:text-emerald-100'
                      : 'border-border/70 bg-card hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold">
                      Hari ke-{d.dayNumber}
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-mono ${
                      isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-muted-foreground'
                    }`}>
                      {getWeatherIcon(d.weatherSummary.icon)}
                      {d.weatherSummary.temp}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-1 max-w-[180px] ${
                    isSelected ? 'text-emerald-800/80 dark:text-emerald-200/80' : 'text-muted-foreground'
                  }`}>
                    {d.theme}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Day Header & Weather Banner */}
          <Card className="p-4 bg-muted/20 border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">{activeDay.dateStr}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{activeDay.theme}</p>
            </div>

            <div className="flex items-center gap-3 bg-background px-3 py-2 rounded-lg border border-border/60 shrink-0">
              {getWeatherIcon(activeDay.weatherSummary.icon)}
              <div>
                <p className="text-xs font-bold text-foreground">
                  {activeDay.weatherSummary.condition} ({activeDay.weatherSummary.temp})
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Peluang Hujan: {activeDay.weatherSummary.rainChance}%
                </p>
              </div>
            </div>
          </Card>

          {/* Warning Banner if present (PRD Section 11 & 14) */}
          {activeDay.warning && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Perhatian Jadwal: </span>
                <span>{activeDay.warning}</span>
              </div>
            </div>
          )}

          {/* Activity Cards Timeline (PRD Section 9 & 19) */}
          <div className="space-y-4">
            {activeDay.activities.map((act) => {
              return (
                <Card
                  key={act.id}
                  className="p-5 border-border/70 hover:border-emerald-500/40 transition-all bg-card/90 backdrop-blur-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Time pill */}
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs shrink-0 border border-emerald-500/20">
                        {act.time}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{act.title}</h4>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {act.category}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                            {act.isOutdoor ? 'Outdoor' : 'Indoor'}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          {act.location}
                        </p>

                        {act.notes && (
                          <p className="text-xs text-muted-foreground/90 pt-1 leading-relaxed">
                            💡 {act.notes}
                          </p>
                        )}

                        {act.weatherWarning && (
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-1 flex items-center gap-1">
                            <CloudRain className="h-3 w-3" />
                            {act.weatherWarning}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Cost */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                      <span className="text-sm font-bold text-foreground font-mono">
                        {act.cost > 0 ? formatRupiah(act.cost) : 'Gratis'}
                      </span>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {act.durationMinutes} mnt
                        </span>
                        {act.travelTimeFromPrevMinutes ? (
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            +{act.travelTimeFromPrevMinutes} mnt
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: Budget Breakdown (PRD Section 12 & 21) */}
        <TabsContent value="budget" className="outline-none">
          <BudgetBreakdownView
            plan={plan}
            onSelectAlternative={(altId) => {
              const selectedAlt = plan.alternatives.find((a) => a.id === altId);
              if (selectedAlt) {
                const currentTotal = plan.budget.totalEstimated || 1;
                const ratio = selectedAlt.totalCost / currentTotal;
                const updated: TripPlan = {
                  ...plan,
                  budget: {
                    accommodation: Math.round(plan.budget.accommodation * ratio),
                    transportation: Math.round(plan.budget.transportation * ratio),
                    food: Math.round(plan.budget.food * ratio),
                    activities: Math.round(plan.budget.activities * ratio),
                    shopping: Math.round(plan.budget.shopping * ratio),
                    emergencyBuffer: Math.round(plan.budget.emergencyBuffer * ratio),
                    totalEstimated: selectedAlt.totalCost,
                  },
                };
                updated.overallHealthScore = updated.budget.totalEstimated <= updated.budgetTotal
                  ? Math.min(98, Math.max(75, Math.round((updated.budget.totalEstimated / (updated.budgetTotal || 1)) * 100)))
                  : Math.max(40, 90 - Math.round(((updated.budget.totalEstimated - updated.budgetTotal) / (updated.budgetTotal || 1)) * 100));
                onUpdatePlan(updated);
              }
            }}
            onApplySavingsTip={(tipId) => {
              const tip = plan.savingsTips.find((t) => t.id === tipId);
              if (tip) {
                const updated: TripPlan = {
                  ...plan,
                  budget: {
                    ...plan.budget,
                    accommodation: tip.id.includes('hotel') || tip.id.includes('1')
                      ? Math.max(0, plan.budget.accommodation - tip.amount)
                      : plan.budget.accommodation,
                    transportation: tip.id.includes('transport') || tip.id.includes('2')
                      ? Math.max(0, plan.budget.transportation - tip.amount)
                      : plan.budget.transportation,
                    activities: tip.id.includes('activity') || tip.id.includes('tiket') || tip.id.includes('3')
                      ? Math.max(0, plan.budget.activities - tip.amount)
                      : plan.budget.activities,
                    emergencyBuffer: plan.budget.emergencyBuffer + Math.round(tip.amount * 0.3),
                    totalEstimated: Math.max(0, plan.budget.totalEstimated - Math.round(tip.amount * 0.7)),
                  },
                };
                updated.overallHealthScore = updated.budget.totalEstimated <= updated.budgetTotal
                  ? Math.min(98, Math.max(75, Math.round((updated.budget.totalEstimated / (updated.budgetTotal || 1)) * 100)))
                  : Math.max(40, 90 - Math.round(((updated.budget.totalEstimated - updated.budgetTotal) / (updated.budgetTotal || 1)) * 100));
                onUpdatePlan(updated);
              }
            }}
          />
        </TabsContent>

        {/* TAB 3: Route & Map View (PRD Section 10 & 20) */}
        <TabsContent value="map" className="outline-none">
          <RouteMapView plan={plan} activeDayNumber={currentActiveDayNumber} />
        </TabsContent>

        {/* TAB 4: Embedded Chatbot (PRD Section 18) */}
        <TabsContent value="chat" className="outline-none">
          <div className="max-w-3xl mx-auto">
            <TripChatbot
              plan={plan}
              onModifyItinerary={handleModifyItinerary}
              onUpdatePlan={(updated) => {
                onUpdatePlan(updated);
                setChatUpdateToast('Rencana perjalanan berhasil diperbarui oleh AI!');
                setTimeout(() => setChatUpdateToast(null), 3500);
              }}
              onNavigateToTimeline={() => setActiveTab('timeline')}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Chat Drawer Modal */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl my-auto">
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatDrawerOpen(false)}
                className="h-8 w-8 p-0 rounded-full bg-background/80 hover:bg-background cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <TripChatbot
              plan={plan}
              onModifyItinerary={handleModifyItinerary}
              onUpdatePlan={(updated) => {
                onUpdatePlan(updated);
                setChatUpdateToast('Rencana perjalanan berhasil diperbarui oleh AI!');
                setTimeout(() => setChatUpdateToast(null), 3500);
              }}
              onNavigateToTimeline={() => {
                setIsChatDrawerOpen(false);
                setActiveTab('timeline');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
