// Importers/callers: src/server/pipeline/planner.ts and src/server/pipeline/chatModifier.ts
// Affected API: POST /api/trips/generate and POST /api/chat
// Data schemas: generateGeminiText(prompt, system, timeout) -> Promise<string | null>, processChatWithAI(...) -> Promise<{ replyText: string; actionKey?: string } | null>
// User verbatim instruction: "make integration with frontend. use gemini api key for ai related stuff."

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || 'AIzaSyAQv2-mZ3Jvg8yp6k2BgNyU14uSEicAbkE';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function generateGeminiText(
  prompt: string,
  systemInstruction?: string,
  timeoutMs: number = 8000
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API error ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText ? candidateText.trim() : null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Gemini API call failed or timed out:', err instanceof Error ? err.message : err);
    return null;
  }
}

// PRD Section 26: Chat assistant with Gemini
export async function processChatWithAI(
  userMessage: string,
  destination: string,
  currentPlanSummary: string
): Promise<{
  replyText: string;
  actionKey?: 'seafood' | 'cheaper_hotel' | 'relaxed' | 'rain_indoor' | 'coffee' | 'custom';
} | null> {
  const systemPrompt = `Kamu adalah TripCraft AI Assistant, pemandu wisata lokal Indonesia yang ramah, ringkas, dan ahli optimasi rute searah untuk ${destination}.
Tugasmu:
1. Jawab pesan wisatawan dengan hangat dalam Bahasa Indonesia (maksimal 3 kalimat).
2. Tentukan satu actionKey yang paling relevan jika wisatawan meminta perubahan:
   - "seafood" (jika minta kuliner seafood / makan malam)
   - "coffee" (jika minta cafe / kopi / sunset spot)
   - "cheaper_hotel" (jika merasa hotel kemahalan / mau lebih hemat)
   - "relaxed" (jika jadwal terlalu padat / minta lebih santai)
   - "rain_indoor" (jika tanya opsi indoor saat hujan)
   - "custom" (perubahan lain atau tanya jawab biasa)

Format keluaran WAJIB persis JSON valid tanpa markdown fence:
{"replyText": "isi balasan hangat", "actionKey": "action_key"}`;

  const prompt = `Itinerary Saat Ini:
${currentPlanSummary}

Pesan Wisatawan: "${userMessage}"`;

  const rawJson = await generateGeminiText(prompt, systemPrompt, 7000);
  if (!rawJson) return null;

  try {
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.replyText) {
      return {
        replyText: parsed.replyText,
        actionKey: parsed.actionKey || 'custom',
      };
    }
  } catch {
    // If json parse fails, use raw text directly
    return {
      replyText: rawJson,
      actionKey: 'custom',
    };
  }

  return null;
}
