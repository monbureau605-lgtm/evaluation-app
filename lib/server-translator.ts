import { GoogleGenAI } from '@google/genai';
import { translateFrenchToAr } from './translator';

/**
 * Server-side robust French -> Arabic translator using Gemini with immediate dictionary fallback.
 */
export async function translateTextToArabic(text: string): Promise<string> {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return '';
  }

  const trimmed = text.trim();

  // If text is already predominantly Arabic, return as-is
  const arabicCharCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicCharCount > trimmed.length * 0.4) {
    return trimmed;
  }

  // Dictionary translation as immediate baseline
  const dictBaseline = translateFrenchToAr(trimmed);

  if (process.env.GEMINI_API_KEY) {
    // Attempt Gemini with a short timeout to prevent blocking UI
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a professional luxury jewelry marketing translator.
Translate this French text into natural, elegant Arabic (العربية الفصحى).
Keep any emojis, numbers, and dates intact.
Output ONLY the clean Arabic translation text with no preamble, no quotes, and no notes.

Text:
${trimmed}`;

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const geminiPromise = ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      }).then((res) => res.text?.trim() || null).catch(() => null);

      const result = await Promise.race([geminiPromise, timeoutPromise]);
      if (result && typeof result === 'string') {
        const clean = result.replace(/^["'«]+|["'»]+$/g, '').trim();
        if (clean.length > 0) {
          return clean;
        }
      }
    } catch {
      // Fallback below
    }
  }

  return dictBaseline;
}
