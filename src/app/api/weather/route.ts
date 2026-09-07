import { NextRequest, NextResponse } from 'next/server';
import { getCityWeatherForecast } from '@/server/engines/weather';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || 'Bandung';
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!, 10) : 3;
    const startDate = searchParams.get('startDate') || undefined;

    const forecasts = await getCityWeatherForecast(city, days, startDate);

    return NextResponse.json({
      success: true,
      city,
      data: forecasts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data cuaca',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
