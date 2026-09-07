import { TravelStyle, BudgetBreakdown, AlternativeScenario } from '@/types/trip';
import { BudgetCalculationResult } from '../types';

interface AllocationPercent {
  hotel: number;
  transport: number;
  food: number;
  activities: number;
  shopping: number;
  buffer: number;
}

const STYLE_ALLOCATIONS: Record<TravelStyle, AllocationPercent> = {
  backpacker: {
    hotel: 0.15,
    transport: 0.2,
    food: 0.3,
    activities: 0.15,
    shopping: 0.05,
    buffer: 0.15,
  },
  budget: {
    hotel: 0.2,
    transport: 0.2,
    food: 0.25,
    activities: 0.15,
    shopping: 0.05,
    buffer: 0.15,
  },
  balanced: {
    hotel: 0.3,
    transport: 0.25,
    food: 0.2,
    activities: 0.1,
    shopping: 0.05,
    buffer: 0.1,
  },
  comfort: {
    hotel: 0.4,
    transport: 0.25,
    food: 0.15,
    activities: 0.1,
    shopping: 0.05,
    buffer: 0.05,
  },
  luxury: {
    hotel: 0.45,
    transport: 0.25,
    food: 0.15,
    activities: 0.1,
    shopping: 0.02,
    buffer: 0.03,
  },
};

// PRD Section 12 Budget Engine & Section 13 Budget Warning
export function calculateBudget(
  totalBudget: number,
  travelStyle: TravelStyle = 'balanced',
  durationDays: number = 3,
  travelers: number = 2,
  actualActivitiesCost: number = 0
): BudgetCalculationResult {
  const allocation = STYLE_ALLOCATIONS[travelStyle] || STYLE_ALLOCATIONS.balanced;

  // Rounding helper to clean Rp thousands
  const roundToTenThousand = (val: number) => Math.round(val / 10000) * 10000;

  const accommodation = roundToTenThousand(totalBudget * allocation.hotel);
  const transportation = roundToTenThousand(totalBudget * allocation.transport);
  const food = roundToTenThousand(totalBudget * allocation.food);
  const activities = actualActivitiesCost > 0
    ? actualActivitiesCost
    : roundToTenThousand(totalBudget * allocation.activities);
  const shopping = roundToTenThousand(totalBudget * allocation.shopping);

  // Dynamic buffer: absorbs differences to keep total on target, or retains base buffer when overspent
  const baseSubtotal = accommodation + transportation + food + activities + shopping;
  const remaining = totalBudget - baseSubtotal;
  const emergencyBuffer = remaining >= 0
    ? remaining
    : roundToTenThousand(totalBudget * allocation.buffer);

  const totalEstimated =
    accommodation + transportation + food + activities + shopping + emergencyBuffer;

  const isOverBudget = totalEstimated > totalBudget;
  const overAmount = isOverBudget ? totalEstimated - totalBudget : 0;
  const utilizationPercentage = Math.round((totalEstimated / totalBudget) * 100);

  // Health score (100 is optimal, penalizes overspending)
  let healthScore = 95;
  if (isOverBudget) {
    const penalty = Math.min(50, Math.round(((totalEstimated - totalBudget) / totalBudget) * 100));
    healthScore = Math.max(40, 90 - penalty);
  } else if (utilizationPercentage < 70) {
    // Under-utilization
    healthScore = 85;
  }

  const warnings: string[] = [];
  if (isOverBudget) {
    warnings.push(
      `⚠️ Melebihi budget Rp${overAmount.toLocaleString('id-ID')}`
    );
  }

  const safeTravelers = Math.max(1, travelers);
  const safeDays = Math.max(1, durationDays);
  const dailyPerPerson = Math.round(totalEstimated / (safeTravelers * safeDays));
  if (dailyPerPerson < 150000 && !isOverBudget) {
    warnings.push(
      `Budget harian per orang (Rp${dailyPerPerson.toLocaleString('id-ID')}) tergolong ketat.`
    );
  }

  // PRD Section 13 saving suggestions
  const savingTips = [
    {
      id: 'tip-hotel',
      text: 'Turunkan kelas akomodasi ke opsi boutique / smart hotel mitra',
      amount: roundToTenThousand(accommodation * 0.25),
      actionLabel: 'Hemat Hotel',
    },
    {
      id: 'tip-transport',
      text: 'Gunakan transportasi umum / sewa motor lepas kunci',
      amount: roundToTenThousand(transportation * 0.3),
      actionLabel: 'Optimalkan Transport',
    },
    {
      id: 'tip-activity',
      text: 'Pilih paket tiket terusan atau prioritaskan destinasi alam bebas tiket',
      amount: roundToTenThousand(activities * 0.2),
      actionLabel: 'Hemat Aktivitas',
    },
  ];

  const breakdown: BudgetBreakdown = {
    accommodation,
    transportation,
    food,
    activities,
    shopping,
    emergencyBuffer,
    totalEstimated,
  };

  return {
    breakdown,
    healthScore,
    isOverBudget,
    overAmount,
    utilizationPercentage,
    warnings,
    savingTips,
  };
}

// PRD Section 22 Alternative Scenarios
export function generateAlternativeScenarios(
  baseBudget: number,
  baseActivityCount: number
): AlternativeScenario[] {
  return [
    {
      id: 'alt-cheapest',
      name: 'Opsi A — Super Hemat',
      badge: 'Paling Terjangkau',
      tagline: 'Hostel estetik + sewa motor + kuliner kaki lima legendaris',
      totalCost: Math.round((baseBudget * 0.72) / 50000) * 50000,
      hotelClass: 'Boutique Hostel / Guest House',
      transportMode: 'Sewa Motor Matic',
      activityCount: Math.max(4, baseActivityCount - 2),
    },
    {
      id: 'alt-balanced',
      name: 'Opsi B — Balanced (Rekomendasi AI)',
      badge: 'Terpopuler & Nyaman',
      tagline: 'Hotel bintang 3 pusat kota + rental mobil + cafe alam',
      totalCost: baseBudget,
      hotelClass: 'Hotel Bintang 3',
      transportMode: 'Mobil Sewa Lepas Kunci',
      activityCount: baseActivityCount,
    },
    {
      id: 'alt-comfort',
      name: 'Opsi C — Comfort Plus',
      badge: 'Maksimal Santai',
      tagline: 'Resort ternama + supir pribadi + resto fine dining',
      totalCost: Math.round((baseBudget * 1.4) / 50000) * 50000,
      hotelClass: 'Resort & Spa Bintang 4-5',
      transportMode: 'Mobil + Driver Pribadi',
      activityCount: baseActivityCount + 1,
    },
  ];
}
