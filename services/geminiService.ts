import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to get fresh API instance with current key
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
};

export interface GenerateOptions {
  imageBase64: string;
  prompt: string;
  aspectRatio: AspectRatio;
  customWidth?: string;
  customHeight?: string;
}

export interface GeminiApiErrorInfo extends Error {
  retryAfterSeconds?: number;
  isQuotaError?: boolean;
}

/**
 * Maps app AspectRatio selection to a supported Gemini imageConfig.aspectRatio string.
 * Supported: "1:1", "3:4", "4:3", "9:16", "16:9", "2:3", "3:2", "21:9"
 */
export const getGeminiAspectRatio = (
  ratio: AspectRatio,
  customWidth?: string,
  customHeight?: string
): string => {
  if (ratio === AspectRatio.SQUARE) return '1:1';
  if (ratio === AspectRatio.PORTRAIT) return '3:4';
  if (ratio === AspectRatio.LANDSCAPE) return '4:3';
  if (ratio === AspectRatio.TALL) return '9:16';

  if (ratio === AspectRatio.CUSTOM && customWidth && customHeight) {
    const w = parseFloat(customWidth);
    const h = parseFloat(customHeight);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      const targetRatio = w / h;
      const supported = [
        { key: '1:1', val: 1.0 },
        { key: '4:3', val: 4 / 3 },
        { key: '3:4', val: 3 / 4 },
        { key: '16:9', val: 16 / 9 },
        { key: '9:16', val: 9 / 16 },
        { key: '3:2', val: 3 / 2 },
        { key: '2:3', val: 2 / 3 },
        { key: '21:9', val: 21 / 9 },
      ];
      let closest = supported[0].key;
      let minDiff = Math.abs(targetRatio - supported[0].val);
      for (const item of supported) {
        const diff = Math.abs(targetRatio - item.val);
        if (diff < minDiff) {
          minDiff = diff;
          closest = item.key;
        }
      }
      return closest;
    }
  }

  return '1:1';
};

/**
 * Parses retry duration from error text if present
 */
export const parseRetryDelay = (errorMessage: string): number | undefined => {
  const secMatch = errorMessage.match(/retry in ([0-9.]+)s/i);
  if (secMatch && secMatch[1]) {
    const parsed = Math.ceil(parseFloat(secMatch[1]));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  const retryDelayMatch = errorMessage.match(/"retryDelay":\s*"(\d+)s"/i);
  if (retryDelayMatch && retryDelayMatch[1]) {
    const parsed = parseInt(retryDelayMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return undefined;
};

export const generateProductImage = async ({
  imageBase64,
  prompt,
  aspectRatio,
  customWidth,
  customHeight
}: GenerateOptions): Promise<string | null> => {
  // Parse Data URL to get mimeType and base64 data
  const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image data URL");
  }
  const mimeType = matches[1];
  const data = matches[2];

  const geminiAspectRatio = getGeminiAspectRatio(aspectRatio, customWidth, customHeight);

  const promptText = `You are a world-class commercial e-commerce product photographer.
Look closely at the product shown in the input image. Generate a pristine commercial listing photograph featuring this EXACT SAME product.

NON-NEGOTIABLE REQUIREMENTS:
1. PRODUCT FIDELITY: Keep the main product 100% IDENTICAL to the reference photo. Do NOT modify the product's shape, geometry, brand logos, badges, text labels, materials, hardware, or colors. The product must remain completely authentic and instantly recognizable.
2. ENVIRONMENT & BACKGROUND: Position this exact product naturally in the following setting: ${prompt}.
3. LIGHTING & REALISM: Professional studio lighting matching the requested environment, with crisp focus, natural contact shadows grounding the product, and subtle surface reflections.
4. COMPOSITION: Centered, clean commercial product presentation without any clutter, distortion, or artificial borders.`;

  const ai = getAiClient();
  const candidateModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: geminiAspectRatio,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      // If response had no image part, try fallback model
      console.warn(`Model ${model} returned candidate without image part, checking fallback...`);
    } catch (error: any) {
      lastError = error;
      const errorStr = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      console.warn(`Model ${model} failed:`, errorStr);

      const isQuota = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota');
      // If quota exceeded specifically for this model or temporary service failure, allow trying the fallback model
      if (!isQuota) {
        // If not a quota/rate error (e.g. fatal bad request), don't loop endlessly
        break;
      }
    }
  }

  // If we reach here, all candidates failed
  const errorMsg = lastError?.message || (typeof lastError === 'string' ? lastError : 'Failed to generate image');
  const customError: GeminiApiErrorInfo = new Error(errorMsg);
  customError.retryAfterSeconds = parseRetryDelay(errorMsg);
  customError.isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');

  console.error("Gemini API generation failed:", customError);
  throw customError;
};