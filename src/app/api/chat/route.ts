import { NextRequest, NextResponse } from 'next/server';
import { ChatModificationRequest } from '@/server/types';
import { modifyItineraryViaChat } from '@/server/pipeline/chatModifier';
import { tripRepository } from '@/server/repositories/tripRepository';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatModificationRequest;

    if (!body || !body.message || !body.currentPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pesan chat dan data itinerary saat ini wajib disertakan.',
        },
        { status: 400 }
      );
    }

    const response = await modifyItineraryViaChat(body);

    // Persist updated plan if tripId exists
    if (body.tripId || response.updatedPlan.id) {
      const id = body.tripId || response.updatedPlan.id;
      await tripRepository.update(id, response.updatedPlan);
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error handling chatbot modification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memproses pesan chat asisten.',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
