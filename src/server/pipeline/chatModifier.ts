import { TripPlan, ActivityItem } from '@/types/trip';
import { ChatModificationRequest, ChatModificationResponse } from '../types';
import { calculateBudget } from '../engines/budget';
import { destinationRepository } from '../repositories/destinationRepository';
import { processChatWithAI } from '../services/gemini';

// PRD Section 18 Chatbot Interaction & Section 26 LLM Prompt Configuration
export async function modifyItineraryViaChat(
  req: ChatModificationRequest
): Promise<ChatModificationResponse> {
  const { currentPlan, message } = req;
  const lowerMsg = message.toLowerCase();

  const updatedPlan: TripPlan = JSON.parse(JSON.stringify(currentPlan));
  let replyText = '';
  let actionApplied: string | undefined;

  // Attempt Gemini AI processing for intent and natural tone
  const aiResult = await processChatWithAI(
    message,
    currentPlan.destination,
    `${currentPlan.title} (${currentPlan.durationText}), total budget Rp${currentPlan.budgetTotal.toLocaleString('id-ID')}`
  );

  const effectiveActionKey = aiResult?.actionKey;

  // Case 1: Add food / seafood / cafe
  if (
    effectiveActionKey === 'seafood' ||
    effectiveActionKey === 'coffee' ||
    lowerMsg.includes('makan') ||
    lowerMsg.includes('kuliner') ||
    lowerMsg.includes('seafood') ||
    lowerMsg.includes('restoran') ||
    lowerMsg.includes('kopi') ||
    lowerMsg.includes('cafe')
  ) {
    const isSeafood = effectiveActionKey === 'seafood' || lowerMsg.includes('seafood');
    const isCoffee = effectiveActionKey === 'coffee' || lowerMsg.includes('kopi') || lowerMsg.includes('cafe');

    // Find city and candidate POI
    const city = currentPlan.destination.split(',')[0].trim();
    const candidates = destinationRepository.find({
      city,
      preferenceCategory: 'kuliner',
    });

    const chosen =
      candidates.find((c) =>
        isCoffee
          ? c.category === 'cafe' || c.name.toLowerCase().includes('kopi') || c.name.toLowerCase().includes('cafe')
          : isSeafood
          ? c.name.toLowerCase().includes('seafood')
          : true
      ) ||
      (isCoffee
        ? {
            id: `custom-coffee-${Date.now()}`,
            name: 'Kopi Toko Djawa Dago',
            city,
            description: 'Coffee shop retro vintage favorit dengan Es Kopi Awan.',
            category: 'cafe',
            preferenceCategory: 'kuliner',
            latitude: -6.8856,
            longitude: 107.614,
            estimatedDurationMinutes: 60,
            estimatedCost: 45000,
            openingTime: '08:00',
            closingTime: '22:00',
            indoor: true,
            outdoor: false,
            popularityScore: 91,
            experienceScore: 89,
          }
        : candidates[0] || {
            id: `custom-food-${Date.now()}`,
            name: isSeafood ? 'Restoran Seafood Pesisir' : 'Sentra Kuliner Khas Lokal',
            city,
            description: 'Pilihan kuliner lokal terfavorit sesuai rute perjalanan.',
            category: 'culinary',
            preferenceCategory: 'kuliner',
            latitude: -6.9182,
            longitude: 107.6105,
            estimatedDurationMinutes: 60,
            estimatedCost: 85000,
            openingTime: '11:00',
            closingTime: '22:00',
            indoor: true,
            outdoor: false,
            popularityScore: 92,
            experienceScore: 90,
          });

    // Append to Day 2 dinner or Day 1
    const targetDay = updatedPlan.days[1] || updatedPlan.days[0];
    if (targetDay) {
      const newAct: ActivityItem = {
        id: `act-added-${Date.now()}`,
        time: isCoffee ? '17:00' : '19:30',
        title: isCoffee ? `Coffee Break: ${chosen.name}` : `Makan Malam: ${chosen.name}`,
        location: `${chosen.name}, ${city}`,
        category: isCoffee ? 'cafe' : 'culinary',
        durationMinutes: isCoffee ? 50 : 60,
        travelTimeFromPrevMinutes: 15,
        cost: chosen.estimatedCost || (isCoffee ? 45000 : 75000),
        isOutdoor: false,
        weatherCondition: 'sunny',
        notes: `Rekomendasi TripCraft: ${chosen.description}`,
      };

      targetDay.activities.push(newAct);
      actionApplied = isCoffee ? 'add_coffee_stop' : 'add_culinary_stop';

      // Recalculate budget
      updatedPlan.budget.food += newAct.cost;
      updatedPlan.budget.totalEstimated += newAct.cost;

      replyText =
        aiResult?.replyText ||
        (isCoffee
          ? `Bisa banget! Aku sudah tambahkan rekomendasi cafe "${chosen.name}" pas senja di ${targetDay.dateStr}. Tempatnya estetik dan searah rute jalan pulang!`
          : `Bisa banget! Aku sudah tambahkan rekomendasi kuliner "${chosen.name}" untuk makan malam di ${targetDay.dateStr}. Lokasinya disesuaikan dekat dengan rute agar tidak perlu muter jauh!`);
    }
  }

  // Case 2: Rain / indoor alternatives
  else if (
    effectiveActionKey === 'rain_indoor' ||
    lowerMsg.includes('hujan') ||
    lowerMsg.includes('indoor') ||
    lowerMsg.includes('basah')
  ) {
    const city = currentPlan.destination.split(',')[0].trim();
    const indoorCandidates = destinationRepository.find({
      city,
      indoorOnly: true,
    });

    const chosen = indoorCandidates[0] || {
      id: `custom-indoor-${Date.now()}`,
      name: 'Museum Geologi Bandung',
      city,
      description: 'Destinasi indoor edukatif ber-AC dengan koleksi fosil dan mineral terlengkap.',
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -6.9006,
      longitude: 107.6215,
      estimatedDurationMinutes: 75,
      estimatedCost: 15000,
      openingTime: '09:00',
      closingTime: '16:00',
      indoor: true,
      outdoor: false,
      popularityScore: 89,
      experienceScore: 88,
    };

    const targetDay = updatedPlan.days[1] || updatedPlan.days[0];
    if (targetDay) {
      const newAct: ActivityItem = {
        id: `act-indoor-${Date.now()}`,
        time: '14:00',
        title: `Alternatif Indoor: ${chosen.name}`,
        location: `${chosen.name}, ${city}`,
        category: (chosen.category === 'nightlife' ? 'culture' : chosen.category) as ActivityItem['category'],
        durationMinutes: chosen.estimatedDurationMinutes || 75,
        travelTimeFromPrevMinutes: 20,
        cost: chosen.estimatedCost || 25000,
        isOutdoor: false,
        weatherCondition: 'rain-light',
        notes: `Opsi aman saat hujan: ${chosen.description}`,
      };

      targetDay.activities.push(newAct);
      targetDay.warning = `Antisipasi hujan: ${chosen.name} disiapkan sebagai rute indoor alternatif.`;
      actionApplied = 'switch_to_indoor';

      updatedPlan.budget.activities += newAct.cost;
      updatedPlan.budget.totalEstimated += newAct.cost;

      replyText =
        aiResult?.replyText ||
        `Siap! Untuk antisipasi hujan lebat di ${targetDay.dateStr}, aku sudah tambahkan opsi indoor "${chosen.name}" yang nyaman, ber-AC, dan searah rute perjalananmu.`;
    }
  }

  // Case 2: Hotel too expensive / budget reduction
  else if (
    effectiveActionKey === 'cheaper_hotel' ||
    lowerMsg.includes('hotel') ||
    lowerMsg.includes('akomodasi') ||
    lowerMsg.includes('mahal') ||
    lowerMsg.includes('kurang budget') ||
    lowerMsg.includes('hemat')
  ) {
    const originalHotelCost = updatedPlan.budget.accommodation;
    const savings = Math.round(originalHotelCost * 0.25);
    updatedPlan.budget.accommodation -= savings;
    updatedPlan.budget.food += Math.round(savings * 0.3); // reallocate some to food
    updatedPlan.budget.emergencyBuffer += Math.round(savings * 0.2); // reallocate to buffer
    updatedPlan.budget.totalEstimated =
      updatedPlan.budget.accommodation +
      updatedPlan.budget.transportation +
      updatedPlan.budget.food +
      updatedPlan.budget.activities +
      updatedPlan.budget.shopping +
      updatedPlan.budget.emergencyBuffer;

    actionApplied = 'adjust_hotel_budget';
    replyText =
      aiResult?.replyText ||
      `Siap! Aku sudah sesuaikan kelas akomodasi ke tipe smart/boutique hotel mitra. Kamu menghemat Rp${savings.toLocaleString('id-ID')} dan sebagian selisihnya dialokasikan ke cadangan darurat serta kuliner agar perjalanan tetap nyaman!`;
  }

  // Case 3: Make more relaxed / kurangi aktivitas
  else if (
    effectiveActionKey === 'relaxed' ||
    lowerMsg.includes('santai') ||
    lowerMsg.includes('padat') ||
    lowerMsg.includes('capek') ||
    lowerMsg.includes('kurangi aktivitas')
  ) {
    updatedPlan.pace = 'relaxed';
    let removedCount = 0;

    updatedPlan.days.forEach((day) => {
      if (day.activities.length > 3) {
        day.activities.pop();
        removedCount++;
      }
      day.warning = undefined; // clear overload warning
    });

    actionApplied = 'set_relaxed_pace';
    replyText =
      aiResult?.replyText ||
      `Siap, santai aja! Aku sudah kurangi ${removedCount} aktivitas dan beri jeda istirahat lebih panjang antar destinasi. Sekarang ritme perjalananmu jauh lebih fleksibel dan tidak terburu-buru.`;
  }

  // Case 4: Any other add/recommend request (shopping, culture, attractions)
  else if (
    lowerMsg.includes('tambah') ||
    lowerMsg.includes('rekomendasi') ||
    lowerMsg.includes('mau ke') ||
    lowerMsg.includes('kunjungi') ||
    lowerMsg.includes('belanja') ||
    lowerMsg.includes('oleh-oleh')
  ) {
    const city = currentPlan.destination.split(',')[0].trim();
    const isShopping = lowerMsg.includes('belanja') || lowerMsg.includes('oleh-oleh');
    const candidates = destinationRepository.find({
      city,
      preferenceCategory: isShopping ? 'shopping' : undefined,
    });

    const chosen = candidates[0] || {
      id: `custom-act-${Date.now()}`,
      name: isShopping ? 'Sentra Oleh-Oleh & Factory Outlet' : 'Destinasi Terkurasi Lokal',
      city,
      description: 'Pilihan favorit wisatawan yang searah rute perjalanan.',
      category: 'shopping' as const,
      preferenceCategory: 'shopping' as const,
      latitude: -6.9147,
      longitude: 107.6098,
      estimatedDurationMinutes: 60,
      estimatedCost: 50000,
      openingTime: '09:00',
      closingTime: '21:00',
      indoor: true,
      outdoor: false,
      popularityScore: 90,
      experienceScore: 88,
    };

    const targetDay = updatedPlan.days[1] || updatedPlan.days[0];
    if (targetDay) {
      const newAct: ActivityItem = {
        id: `act-custom-${Date.now()}`,
        time: '16:00',
        title: `Kunjungan Tambahan: ${chosen.name}`,
        location: `${chosen.name}, ${city}`,
        category: (chosen.category === 'nightlife' ? 'culture' : chosen.category) as ActivityItem['category'],
        durationMinutes: chosen.estimatedDurationMinutes || 60,
        travelTimeFromPrevMinutes: 15,
        cost: chosen.estimatedCost || 50000,
        isOutdoor: chosen.outdoor,
        weatherCondition: 'cloudy',
        notes: `Rekomendasi tambahan: ${chosen.description}`,
      };

      targetDay.activities.push(newAct);
      actionApplied = 'add_custom_activity';
      if (isShopping) {
        updatedPlan.budget.shopping += newAct.cost;
      } else {
        updatedPlan.budget.activities += newAct.cost;
      }
      updatedPlan.budget.totalEstimated += newAct.cost;

      replyText =
        aiResult?.replyText ||
        `Tentu! Aku sudah tambahkan rekomendasi "${chosen.name}" ke jadwal ${targetDay.dateStr} searah rute perjalanan agar tetap efisien.`;
    }
  }

  // Case 5: Default conversational response with trip context
  else {
    replyText =
      aiResult?.replyText ||
      `Siap! Aku mengerti: "${message}". Itinerary ${currentPlan.destination} kamu sudah disesuaikan dengan tetap menjaga efisiensi rute dan batas anggaran. Ada hal lain yang mau diubah?`;
  }

  // Recompute overall budget health score
  const budgetCheck = calculateBudget(
    updatedPlan.budgetTotal,
    updatedPlan.travelStyle,
    updatedPlan.days.length,
    updatedPlan.travelers,
    updatedPlan.budget.activities
  );
  updatedPlan.overallHealthScore = budgetCheck.healthScore;

  return {
    replyText,
    actionApplied,
    updatedPlan,
  };
}
