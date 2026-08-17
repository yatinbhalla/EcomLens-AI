import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: "A red cat",
      config: {
        candidateCount: 4,
        imageConfig: {
          aspectRatio: "1:1"
        },
      }
    });
    console.log("Candidates:", response.candidates?.length);
  } catch (e) {
    console.error("Failed candidateCount:", e.message);
  }
}
test();
