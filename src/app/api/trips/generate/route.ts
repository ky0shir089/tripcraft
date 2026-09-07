import { NextRequest, NextResponse } from 'next/server';
import { GenerateTripRequest } from '@/server/types';
import { generateTripPlanPipeline } from '@/server/pipeline/planner';
import { tripRepository } from '@/server/repositories/tripRepository';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateTripRequest;

    // PRD Section 6 & 31: Input Validation
    if (!body || !body.destination || typeof body.destination !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Destinasi wajib diisi. Masukkan nama kota atau daerah tujuan.',
          code: 'INVALID_DESTINATION',
        },
        { status: 400 }
      );
    }

    if (body.budget !== undefined && body.budget < 300000) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Budget terlalu kecil untuk menyusun itinerary realistis. Minimal budget Rp300.000.',
          code: 'BUDGET_TOO_LOW',
        },
        { status: 400 }
      );
    }

    // Run deterministic multi-stage AI Planner pipeline
    const plan = await generateTripPlanPipeline(body);

    // Save generated trip to repository
    await tripRepository.create(plan);

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error generating trip plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan sistem saat menyusun rencana perjalanan. Silakan coba lagi.',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
