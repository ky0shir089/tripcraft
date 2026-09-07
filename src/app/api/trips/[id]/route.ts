import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/server/repositories/tripRepository';
import { TripPlan } from '@/types/trip';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memuat trip',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<TripPlan>;

    const updated = await tripRepository.update(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Trip tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui trip',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const success = await tripRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Trip tidak ditemukan atau sudah dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trip berhasil dihapus',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus trip',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
