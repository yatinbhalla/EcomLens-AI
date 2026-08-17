import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to get fresh API instance with current key
const getAiClient = () => {
  // We assume the key is injected by the environment or the selection dialog
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

interface GenerateOptions {
  imageBase64: string;
  prompt: string;
  aspectRatio: AspectRatio;
}

export const generateProductImage = async ({
  imageBase64,
  prompt,
  aspectRatio
}: GenerateOptions): Promise<string | null> => {
  try {
    const ai = getAiClient();
    
    // Parse Data URL to get mimeType and base64 data
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid image data URL");
    }
    const mimeType = matches[1];
    const data = matches[2];

    // Using gemini-3.1-flash-image for standard generation
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data,
            },
          },
          {
            text: `PRODUCT BACKGROUND REPLACEMENT.
CRITICAL INSTRUCTIONS:
1. You MUST keep the main product EXACTLY as it appears in the uploaded image.
2. DO NOT change the product's shape, color, details, texture, or perspective.
3. Replace ONLY the background and lighting to match this setting: ${prompt}.
4. Ensure the product integrates naturally into the new background with realistic shadows and reflections.`,
          },
        ],
      },
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};