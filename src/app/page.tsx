'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { TripConfigWizard } from '@/components/config/TripConfigWizard';
import { AIGenerationProgress } from '@/components/loading/AIGenerationProgress';
import { ItineraryView } from '@/components/itinerary/ItineraryView';
import { TripConfig, TripPlan } from '@/types/trip';
import { bandungTripPlan, generateCustomPlan } from '@/data/mockTrips';

export default function Home() {
  const [viewState, setViewState] = useState<'landing' | 'loading' | 'itinerary'>('landing');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardCity, setWizardCity] = useState('Bandung');
  const [currentPlan, setCurrentPlan] = useState<TripPlan>(bandungTripPlan);
  const [apiGeneratedPlan, setApiGeneratedPlan] = useState<TripPlan | null>(null);
  const apiGeneratedPlanRef = React.useRef<TripPlan | null>(null);

  // Staged config during loading animation
  const [pendingConfig, setPendingConfig] = useState<{
    destination: string;
    budget: number;
    durationDays: number;
    travelers: number;
    fullConfig?: TripConfig;
  }>({
    destination: 'Bandung',
    budget: 3000000,
    durationDays: 3,
    travelers: 2,
  });

  const fetchTripPlanFromApi = async (payload: {
    destination: string;
    budget: number;
    durationDays: number;
    travelers: number;
    travelStyle?: string;
    pace?: string;
    preferences?: TripConfig['preferences'];
    startDate?: string;
  }) => {
    try {
      const res = await fetch('/api/trips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        apiGeneratedPlanRef.current = data.data;
        setApiGeneratedPlan(data.data);
        setCurrentPlan(data.data);
        return data.data;
      }
    } catch (err) {
      console.warn('API generate failed, fallback to local generator:', err);
    }
    return null;
  };

  // Handler for Quick Generator from Landing
  const handleQuickGenerate = (
    destination: string,
    budget: number,
    durationDays: number,
    travelers: number
  ) => {
    setPendingConfig({
      destination,
      budget,
      durationDays,
      travelers,
    });
    apiGeneratedPlanRef.current = null;
    setApiGeneratedPlan(null);
    fetchTripPlanFromApi({
      destination,
      budget,
      durationDays,
      travelers,
      travelStyle: 'balanced',
      pace: 'balanced',
    });
    setViewState('loading');
  };

  // Handler from Detailed Wizard
  const handleWizardSubmit = (config: TripConfig) => {
    setIsWizardOpen(false);
    setPendingConfig({
      destination: config.destination,
      budget: config.budget,
      durationDays: config.durationDays,
      travelers: config.travelers,
      fullConfig: config,
    });
    apiGeneratedPlanRef.current = null;
    setApiGeneratedPlan(null);
    fetchTripPlanFromApi({
      destination: config.destination,
      budget: config.budget,
      durationDays: config.durationDays,
      travelers: config.travelers,
      travelStyle: config.travelStyle,
      pace: config.pace,
      preferences: config.preferences,
      startDate: config.startDate,
    });
    setViewState('loading');
  };

  // Callback when AI generation progress animation finishes
  const handleGenerationComplete = () => {
    const planToUse = apiGeneratedPlanRef.current || apiGeneratedPlan;
    if (planToUse) {
      setCurrentPlan(planToUse);
    } else if (
      pendingConfig.destination.toLowerCase().includes('bandung') &&
      !pendingConfig.fullConfig
    ) {
      setCurrentPlan(bandungTripPlan);
    } else {
      const generated = generateCustomPlan(
        pendingConfig.fullConfig || {
          destination: pendingConfig.destination,
          budget: pendingConfig.budget,
          durationDays: pendingConfig.durationDays,
          travelers: pendingConfig.travelers,
        }
      );
      setCurrentPlan(generated);
    }
    setViewState('itinerary');
  };

  const handleOpenDetailedWizard = (initialCity?: string) => {
    if (initialCity) {
      const city = initialCity.split(',')[0].trim();
      setWizardCity(city);
    }
    setIsWizardOpen(true);
  };

  const handleSelectSampleCity = (city: string) => {
    if (city === 'Bandung') {
      setCurrentPlan(bandungTripPlan);
      setViewState('itinerary');
    } else {
      handleQuickGenerate(
        city,
        city === 'Bali' ? 5000000 : 3000000,
        city === 'Bali' ? 4 : 3,
        2
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* Top Navigation */}
      <Navbar
        onNewTripClick={() => handleOpenDetailedWizard()}
        onSelectSampleCity={handleSelectSampleCity}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {viewState === 'landing' && (
          <LandingHero
            onQuickGenerate={handleQuickGenerate}
            onOpenDetailedWizard={handleOpenDetailedWizard}
          />
        )}

        {viewState === 'loading' && (
          <AIGenerationProgress
            destination={pendingConfig.destination}
            budget={pendingConfig.budget}
            durationDays={pendingConfig.durationDays}
            travelers={pendingConfig.travelers}
            isReady={Boolean(apiGeneratedPlan)}
            onComplete={handleGenerationComplete}
          />
        )}

        {viewState === 'itinerary' && (
          <ItineraryView
            plan={currentPlan}
            onEditConfig={() => handleOpenDetailedWizard(currentPlan.destination)}
            onUpdatePlan={(updated) => setCurrentPlan(updated)}
            onResetToLanding={() => setViewState('landing')}
          />
        )}
      </main>

      {/* Detailed Trip Configuration Modal */}
      <TripConfigWizard
        isOpen={isWizardOpen}
        initialCity={viewState === 'itinerary' ? currentPlan.destination : wizardCity}
        initialBudget={viewState === 'itinerary' ? currentPlan.budgetTotal : pendingConfig.budget}
        initialDays={viewState === 'itinerary' ? currentPlan.days.length : pendingConfig.durationDays}
        initialTravelers={viewState === 'itinerary' ? currentPlan.travelers : pendingConfig.travelers}
        initialTravelStyle={viewState === 'itinerary' ? currentPlan.travelStyle : pendingConfig.fullConfig?.travelStyle}
        initialPace={viewState === 'itinerary' ? currentPlan.pace : pendingConfig.fullConfig?.pace}
        onClose={() => setIsWizardOpen(false)}
        onGenerateTrip={handleWizardSubmit}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/20 text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground font-heading">TripCraft</span>
            <span>— Asisten Perencana Rute & Estimasi Anggaran Wisata Realistis</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Bahasa Indonesia</span>
            <span>·</span>
            <span>Prakiraan Cuaca Terintegrasi</span>
            <span>·</span>
            <span>Optimasi TSP Searah</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
