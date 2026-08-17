import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.editImage({
      model: 'gemini-3.1-flash-image',
      prompt: 'A red cat',
      referenceImages: [
        {
           referenceType: "SUBJECT",
           referenceImage: {
              imageBytes: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
              mimeType: "image/png"
           }
        } as any
      ]
    });
    console.log("Edit images:", response.generatedImages?.length);
  } catch (e) {
    console.error("Edit failed:", e.message);
  }
}
test();
