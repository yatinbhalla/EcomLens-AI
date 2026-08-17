import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A red cat',
      config: {
        numberOfImages: 4,
        aspectRatio: '1:1'
      }
    });
    console.log("Images:", response.generatedImages?.length);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
test();
