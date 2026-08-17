import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: "A red cat",
      config: {
        imageConfig: {
          numberOfImages: 4,
          aspectRatio: "1:1"
        },
      }
    });
    console.log("Images:", response.candidates?.[0]?.content?.parts?.length);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
test();
