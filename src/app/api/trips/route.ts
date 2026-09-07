import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/server/repositories/tripRepository';
import { TripPlan } from '@/types/trip';

export async function GET() {
  try {
    const trips = await tripRepository.list();
    return NextResponse.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil daftar trip',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TripPlan;

    if (!body || !body.destination) {
      return NextResponse.json(
        { success: false, error: 'Data trip tidak lengkap' },
        { status: 400 }
      );
    }

    const created = await tripRepository.create(body);
    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menyimpan trip',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
