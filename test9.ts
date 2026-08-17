import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.recontextImage({
      model: 'gemini-3.1-flash-image',
      source: {
        prompt: 'A red cat',
      }
    });
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
test();
