'use client';

import React from 'react';
import {
  Wallet,
  Hotel,
  Car,
  Utensils,
  Ticket,
  ShoppingBag,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TripPlan } from '@/types/trip';

interface BudgetBreakdownViewProps {
  plan: TripPlan;
  onSelectAlternative?: (altId: string) => void;
  onApplySavingsTip?: (tipId: string) => void;
}

export const BudgetBreakdownView: React.FC<BudgetBreakdownViewProps> = ({
  plan,
  onSelectAlternative,
  onApplySavingsTip,
}) => {
  const { budget, budgetTotal } = plan;
  const isWithinBudget = budget.totalEstimated <= budgetTotal;
  const budgetDiff = Math.abs(budgetTotal - budget.totalEstimated);
  const healthPercent = Math.min(100, Math.round((budget.totalEstimated / budgetTotal) * 100));

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const categories = [
    {
      name: 'Akomodasi & Hotel',
      amount: budget.accommodation,
      pct: Math.round((budget.accommodation / budget.totalEstimated) * 100),
      icon: Hotel,
      color: 'bg-emerald-600 dark:bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      name: 'Transportasi & Bensin',
      amount: budget.transportation,
      pct: Math.round((budget.transportation / budget.totalEstimated) * 100),
      icon: Car,
      color: 'bg-teal-600 dark:bg-teal-500',
      textColor: 'text-teal-700 dark:text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
    {
      name: 'Kuliner & Makan',
      amount: budget.food,
      pct: Math.round((budget.food / budget.totalEstimated) * 100),
      icon: Utensils,
      color: 'bg-amber-600 dark:bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      name: 'Aktivitas & Tiket Wisata',
      amount: budget.activities,
      pct: Math.round((budget.activities / budget.totalEstimated) * 100),
      icon: Ticket,
      color: 'bg-sky-600 dark:bg-sky-500',
      textColor: 'text-sky-700 dark:text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      name: 'Shopping & Misc',
      amount: budget.shopping,
      pct: Math.round((budget.shopping / budget.totalEstimated) * 100),
      icon: ShoppingBag,
      color: 'bg-stone-500',
      textColor: 'text-stone-700 dark:text-stone-300',
      bgColor: 'bg-stone-500/10',
    },
    {
      name: 'Buffer Darurat (Cadangan)',
      amount: budget.emergencyBuffer,
      pct: Math.round((budget.emergencyBuffer / budget.totalEstimated) * 100),
      icon: LifeBuoy,
      color: 'bg-rose-500',
      textColor: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Allocated Budget */}
        <Card className="p-5 bg-card/70 border-border/70 backdrop-blur-sm">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Target Alokasi Budget
          </p>
          <p className="text-2xl font-extrabold text-foreground mt-2 font-mono">
            {formatRupiah(budgetTotal)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Untuk {plan.travelers} wisatawan ({plan.durationText})
          </p>
        </Card>

        {/* Estimated Real Cost */}
        <Card className="p-5 bg-card/70 border-border/70 backdrop-blur-sm">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" /> Total Estimasi Realistis AI
          </p>
          <p className="text-2xl font-extrabold text-foreground mt-2 font-mono">
            {formatRupiah(budget.totalEstimated)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Termasuk tiket, akomodasi, BBM & buffer
          </p>
        </Card>

        {/* Health Status */}
        <Card
          className={`p-5 border backdrop-blur-sm ${
            isWithinBudget
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : 'bg-rose-500/5 border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              {isWithinBudget ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Within Budget</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span className="text-rose-700 dark:text-rose-400 font-bold">Over Budget</span>
                </>
              )}
            </p>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-background">
              {healthPercent}%
            </span>
          </div>

          <p className="text-sm font-semibold text-foreground mt-2.5">
            {isWithinBudget
              ? `Sisa cadangan aman: ${formatRupiah(budgetDiff)}`
              : `Melebihi target: ${formatRupiah(budgetDiff)}`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isWithinBudget
              ? 'Anggaran teralokasi dengan proporsional dan realistis.'
              : 'Gunakan saran penghematan di bawah untuk menyesuaikan.'}
          </p>
        </Card>
      </div>

      {/* Stacked Visual Progress Bar */}
      <Card className="p-6 bg-card/70 border-border/70 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Proporsi Distribusi Pengeluaran</h3>
            <p className="text-xs text-muted-foreground">Kombinasi biaya per kategori perjalanan</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Gaya: {plan.travelStyle.toUpperCase()}
          </span>
        </div>

        {/* Multi-segment bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted p-0.5 gap-0.5">
          {categories.map((cat, i) => (
            <div
              key={i}
              title={`${cat.name}: ${cat.pct}%`}
              style={{ width: `${cat.pct}%` }}
              className={`${cat.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-85`}
            />
          ))}
        </div>

        {/* Detailed Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${cat.bgColor} ${cat.textColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{cat.name}</p>
                    <p className="text-[11px] text-muted-foreground">{cat.pct}% dari total</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground font-mono">
                  {formatRupiah(cat.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Smart Savings Suggestions (PRD Section 13) */}
      <Card className="p-6 bg-card/70 border-border/70 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Rekomendasi Penghematan Cerdas</h3>
            <p className="text-xs text-muted-foreground">Opsi alternatif untuk menekan biaya tanpa mengurangi keseruan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plan.savingsTips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 rounded-xl border border-border/60 bg-background flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Hemat {formatRupiah(tip.amount)}
                </span>
                <p className="text-xs font-medium text-foreground pt-1">{tip.text}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplySavingsTip?.(tip.id)}
                className="w-full text-xs gap-1.5 h-8 border-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
              >
                <span>{tip.actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Alternative Scenarios (PRD Section 22) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground font-heading">
            Skenario Alternatif Tanpa Buat Ulang
          </h3>
          <p className="text-xs text-muted-foreground">
            Bandingkan beberapa opsi rancangan anggaran langsung dalam satu klik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.alternatives.map((alt) => (
            <Card
              key={alt.id}
              className="p-5 border-border/70 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 bg-card/80"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {alt.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">{alt.activityCount} Aktivitas</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{alt.name}</h4>
                <p className="text-xs text-muted-foreground">{alt.tagline}</p>
                <div className="pt-2 border-t border-border/50 space-y-1 text-[11px] text-muted-foreground">
                  <p>🏨 {alt.hotelClass}</p>
                  <p>🚗 {alt.transportMode}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Total Estimasi</p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatRupiah(alt.totalCost)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectAlternative?.(alt.id)}
                  className="text-xs h-8 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700"
                >
                  Pilih Opsi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
