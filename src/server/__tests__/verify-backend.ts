import assert from 'node:assert';
import { calculateDestinationScore } from '../engines/scoring';
import { calculateDistanceKm, optimizeRouteSequence } from '../engines/route';
import { calculateBudget } from '../engines/budget';
import { getCityWeatherForecast, evaluateWeatherForActivity } from '../engines/weather';
import { destinationRepository } from '../repositories/destinationRepository';
import { tripRepository } from '../repositories/tripRepository';
import { generateTripPlanPipeline } from '../pipeline/planner';
import { modifyItineraryViaChat } from '../pipeline/chatModifier';
import { DESTINATIONS_DATA } from '../data/destinations';

async function runBackendVerification() {
  console.log('--- STARTING TRIPCRAFT BACKEND VERIFICATION ---');

  // 1. SCORING ENGINE (PRD Section 17)
  console.log('1. Testing Scoring Engine...');
  const sampleDest = DESTINATIONS_DATA[0]; // Tangkuban Perahu
  const scoreResult = calculateDestinationScore(
    sampleDest,
    { alam: 'love' },
    50000,
    10,
    false
  );
  assert.ok(scoreResult.total >= 0 && scoreResult.total <= 100, 'Score must be between 0 and 100');
  assert.strictEqual(scoreResult.preferenceMatch, 100, 'Love rating should equal 100');
  console.log('✓ Scoring Engine verified');

  // 2. ROUTE & TSP OPTIMIZATION (PRD Section 10 & 15)
  console.log('2. Testing Route & TSP Optimizer...');
  const dist = calculateDistanceKm(-6.9175, 107.6098, -6.9213, 107.6097);
  assert.ok(dist > 0 && dist < 1.0, 'Distance between Braga & Museum KAA should be ~0.4km');

  const northAndSouth = [
    DESTINATIONS_DATA.find((d) => d.id === 'bdg-kawah-putih')!, // South
    DESTINATIONS_DATA.find((d) => d.id === 'bdg-tangcuban')!, // North
    DESTINATIONS_DATA.find((d) => d.id === 'bdg-situ-patenggang')!, // South
  ];
  const routeOpt = optimizeRouteSequence(northAndSouth);
  assert.strictEqual(routeOpt.orderedDestinations.length, 3, 'All destinations should be preserved');
  console.log('✓ Route Optimizer verified');

  // 3. BUDGET ENGINE (PRD Section 12 & 13)
  console.log('3. Testing Budget Engine...');
  const budgetResult = calculateBudget(3000000, 'balanced', 3, 2, 350000);
  assert.strictEqual(budgetResult.breakdown.accommodation, 900000, 'Balanced hotel allocation is 30%');
  assert.strictEqual(budgetResult.breakdown.transportation, 750000, 'Balanced transport allocation is 25%');
  assert.strictEqual(budgetResult.isOverBudget, false, '3M budget should not be over budget');

  const overBudgetResult = calculateBudget(1000000, 'balanced', 3, 2, 1500000);
  assert.strictEqual(overBudgetResult.isOverBudget, true, 'High activity cost should trigger over budget');
  assert.ok(overBudgetResult.warnings.length > 0, 'Should produce over budget warning');
  console.log('✓ Budget Engine verified');

  // 4. WEATHER ENGINE (PRD Section 14)
  console.log('4. Testing Weather Engine...');
  const forecasts = await getCityWeatherForecast('Bandung', 3);
  assert.strictEqual(forecasts.length, 3, 'Must return 3 days forecast');
  const weatherWarningCheck = evaluateWeatherForActivity(true, {
    date: '2026-09-08',
    tempC: 22,
    tempDisplay: '22°C',
    condition: 'rain-light',
    rainChance: 70,
    humidity: 80,
    icon: 'CloudRain',
    summary: 'Hujan siang hari',
  });
  assert.strictEqual(weatherWarningCheck.suggestIndoorFallback, true, 'Rain >=60% should suggest indoor fallback');
  console.log('✓ Weather Engine verified');

  // 5. DESTINATION REPOSITORY (PRD Section 16)
  console.log('5. Testing Destination Repository...');
  const bandungList = destinationRepository.find({ city: 'Bandung' });
  assert.ok(bandungList.length >= 8, 'Should have multiple Bandung destinations');
  const recommended = destinationRepository.recommend('Bandung', { kuliner: 'love' }, 80000, false, 5);
  assert.strictEqual(recommended.length, 5, 'Should return top 5 recommendations');
  console.log('✓ Destination Repository verified');

  // 6. AI PLANNER PIPELINE (PRD Section 25 & 26)
  console.log('6. Testing End-to-End AI Trip Planner Pipeline...');
  const generatedPlan = await generateTripPlanPipeline({
    destination: 'Bandung',
    durationDays: 3,
    travelers: 2,
    budget: 3000000,
    travelStyle: 'balanced',
    pace: 'balanced',
    preferences: {
      kuliner: 'love',
      alam: 'like',
    },
  });

  assert.ok(generatedPlan.id.startsWith('trip-'), 'Generated plan has valid trip ID');
  assert.strictEqual(generatedPlan.days.length, 3, 'Generated plan has 3 days');
  assert.ok(generatedPlan.days[0].activities.length > 0, 'Day 1 has activities');
  assert.ok(generatedPlan.alternatives.length === 3, 'Must generate 3 alternative scenarios (Section 22)');
  console.log('✓ AI Planner Pipeline verified');

  // 7. CHATBOT MODIFICATION ENGINE (PRD Section 18)
  console.log('7. Testing Chatbot Modification Engine...');
  const chatModResult = await modifyItineraryViaChat({
    tripId: generatedPlan.id,
    currentPlan: generatedPlan,
    message: 'Tambahkan tempat makan seafood untuk makan malam',
  });
  assert.strictEqual(chatModResult.actionApplied, 'add_culinary_stop', 'Should identify culinary addition');
  assert.ok(chatModResult.replyText.length > 10, 'Should return warm Indonesian assistant reply');

  const relaxResult = await modifyItineraryViaChat({
    tripId: generatedPlan.id,
    currentPlan: generatedPlan,
    message: 'Buat itinerary lebih santai dan jangan terlalu padat',
  });
  assert.strictEqual(relaxResult.actionApplied, 'set_relaxed_pace', 'Should identify relaxed pace modification');
  console.log('✓ Chatbot Modification Engine verified');

  // 8. TRIP REPOSITORY CRUD
  console.log('8. Testing Trip Repository CRUD...');
  const createdTrip = await tripRepository.create(generatedPlan);
  assert.strictEqual(createdTrip.id, generatedPlan.id);
  const fetched = await tripRepository.findById(createdTrip.id);
  assert.ok(fetched !== null, 'Fetched trip should exist');
  const allTrips = await tripRepository.list();
  assert.ok(allTrips.length >= 1, 'Trip list should contain saved trips');
  console.log('✓ Trip Repository verified');

  console.log('ALL 8 BACKEND VERIFICATION SUITES PASSED SUCCESSFULLY!');
}

runBackendVerification().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
