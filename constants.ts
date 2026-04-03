import { AspectRatio, PresetStyle } from './types';
import { ShoppingBag, Globe, Camera, Star, Zap } from 'lucide-react';

export const PRESET_PROMPTS: Record<PresetStyle, string> = {
  Amazon: "Pure white background (RGB 255,255,255), soft even studio lighting, high sharpness, no harsh shadows, professional e-commerce standard.",
  Meesho: "Clean light grey background, bright lighting, clear product details, vibrant colors, approachable look.",
  Lifestyle: "In-context usage, blurred natural background, warm sunlight, organic feel, cozy atmosphere.",
  Premium: "Dark moody background, dramatic rim lighting, high contrast, luxury texture, cinematic look.",
  Minimalist: "Solid pastel color background, hard shadows, trendy pop-art style, clean composition."
};

export const PRESET_ICONS: Record<PresetStyle, any> = {
  Amazon: ShoppingBag,
  Meesho: Globe,
  Lifestyle: Camera,
  Premium: Star,
  Minimalist: Zap
};

export const ASPECT_RATIOS = [
  { label: '1:1 Square', value: AspectRatio.SQUARE },
  { label: '3:4 Portrait', value: AspectRatio.PORTRAIT },
  { label: '4:3 Landscape', value: AspectRatio.LANDSCAPE },
  { label: '9:16 Story', value: AspectRatio.TALL },
];
