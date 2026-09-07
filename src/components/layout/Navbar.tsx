'use client';

import React from 'react';
import { Compass, Sparkles, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NavbarProps {
  onNewTripClick: () => void;
  onSelectSampleCity: (city: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewTripClick, onSelectSampleCity }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/10">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground font-heading">
                TripCraft
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                AI Planner
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Rencana Perjalanan Realistis & Bebas Pusing
            </p>
          </div>
        </Link>

        {/* Quick sample destinations */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-xs font-medium mr-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Contoh Rute:
          </span>
          <button
            onClick={() => onSelectSampleCity('Bandung')}
            className="px-2.5 py-1 rounded-md hover:bg-muted hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Bandung (3D2N)
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => onSelectSampleCity('Yogyakarta')}
            className="px-2.5 py-1 rounded-md hover:bg-muted hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Yogyakarta (3D2N)
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => onSelectSampleCity('Bali')}
            className="px-2.5 py-1 rounded-md hover:bg-muted hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Bali (4D3N)
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewTripClick}
            className="gap-1.5 border-border/80 shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sesuaikan Parameter</span>
            <span className="sm:hidden">Atur</span>
          </Button>
          <Button
            size="sm"
            onClick={onNewTripClick}
            className="gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Rencanakan Trip</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
