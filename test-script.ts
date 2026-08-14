import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    console.log("Request 1...");
    await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: "A red cat",
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    console.log("Success 1. Waiting 3s...");
    await new Promise(r => setTimeout(r, 3000));
    console.log("Request 2...");
    await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: "A blue cat",
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    console.log("Success 2.");
  } catch (e) {
    console.error(e.message);
  }
}
test();
