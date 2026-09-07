// Importers/callers: Test suite runner
// Affected API: generateGeminiText and modifyItineraryViaChat
// Data schemas: asserts string output from generateGeminiText and ChatModificationResponse
// User verbatim instruction: "make integration with frontend. use gemini api key for ai related stuff."

import assert from 'node:assert';
import { generateGeminiText } from '../services/gemini';
import { modifyItineraryViaChat } from '../pipeline/chatModifier';
import { bandungTripPlan } from '../../data/mockTrips';

async function verifyGemini() {
  console.log('Testing Gemini API integration...');

  const prompt = 'Berikan 1 rekomendasi tempat wisata alam terbaik di Bandung dalam 1 kalimat.';
  const text = await generateGeminiText(prompt);
  console.log('Gemini raw response:', text);
  assert.ok(text && text.length > 5, 'Gemini should return a non-empty text response');

  const chatRes = await modifyItineraryViaChat({
    tripId: bandungTripPlan.id,
    currentPlan: bandungTripPlan,
    message: 'Tolong carikan cafe kopi estetik buat senja di Bandung',
  });
  console.log('Chat action applied:', chatRes.actionApplied);
  console.log('Chat reply text:', chatRes.replyText);
  assert.ok(chatRes.replyText.length > 0, 'Chat should return reply');

  console.log('✓ Gemini AI integration verified successfully!');
}

verifyGemini().catch((err) => {
  console.error('Gemini verification failed:', err);
  process.exit(1);
});
