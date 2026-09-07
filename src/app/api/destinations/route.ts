import { NextRequest, NextResponse } from 'next/server';
import { destinationRepository } from '@/server/repositories/destinationRepository';
import { ActivityPreference, RatingValue } from '@/types/trip';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || undefined;
    const category = searchParams.get('category') || undefined;
    const preference = (searchParams.get('preference') as ActivityPreference) || undefined;
    const recommend = searchParams.get('recommend') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    if (recommend && city) {
      const budgetPerActivity = searchParams.get('budgetPerActivity')
        ? parseInt(searchParams.get('budgetPerActivity')!, 10)
        : 100000;
      const isRaining = searchParams.get('isRaining') === 'true';

      const preferences: Partial<Record<ActivityPreference, RatingValue>> = {};
      if (preference) {
        preferences[preference] = 'love';
      }

      const recommendations = destinationRepository.recommend(
        city,
        preferences,
        budgetPerActivity,
        isRaining,
        limit
      );

      return NextResponse.json({
        success: true,
        count: recommendations.length,
        data: recommendations,
      });
    }

    const destinations = destinationRepository.find({
      city,
      category,
      preferenceCategory: preference,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mencari destinasi',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
