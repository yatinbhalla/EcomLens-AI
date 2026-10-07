import { AspectRatio, PresetStyle } from './types';
import {
  ShoppingBag,
  Globe,
  Camera,
  Star,
  Zap,
  Layers,
  Sparkles,
  Leaf,
  Coffee,
  Home,
  Cpu,
  Award,
  Palette,
  LucideIcon
} from 'lucide-react';

export const PRESET_PROMPTS: Record<PresetStyle, string> = {
  // Original 5 presets
  Amazon: "Pure white background (RGB 255,255,255), soft even studio lighting, high sharpness, no harsh shadows, professional e-commerce standard.",
  Meesho: "Clean light grey background, bright lighting, clear product details, vibrant colors, approachable look.",
  Lifestyle: "In-context usage, blurred natural background, warm sunlight, organic feel, cozy atmosphere.",
  Premium: "Dark moody background, dramatic rim lighting, high contrast, luxury texture, cinematic look.",
  Minimalist: "Solid pastel color background, hard shadows, trendy pop-art style, clean composition.",
  
  // Additional e-commerce listing styles
  "Studio Podium": "Minimalist geometric cylindrical podium pedestal, soft neutral architectural backdrop, subtle elegant contact shadows, diffuse softbox studio lighting, high-end commercial showcase.",
  "Marble Luxury": "Polished white Carrara marble slab surface with delicate natural veining, soft window daylight, crisp reflective gloss, boutique luxury product presentation.",
  "Outdoor Nature": "Fresh outdoor setting, blurred lush green botanical foliage, warm dappled natural sunlight, organic earth tones, fresh and vibrant eco-friendly aesthetic.",
  "Artisan Wood": "Warm rustic oak wooden tabletop, soft warm morning sidelight, authentic organic grain texture, handcrafted artisan lifestyle aesthetic.",
  "Kitchen & Home": "Modern bright kitchen marble countertop, soft-focus clean ceramic tile backsplash, warm ambient interior lighting, inviting home lifestyle context.",
  "Neon Cyber": "Sleek glossy dark reflective surface, dramatic dual-tone cyan and electric violet rim lighting, sharp futuristic high-tech gadget aesthetic.",
  "Hero Showcase": "Dynamic commercial hero shot, subtle gradient studio backdrop with soft central spotlight halo, crisp floating perspective, bold advertising listing photo.",
  "Pastel Studio": "Soft blush pastel backdrop, gentle dual-toned softbox studio lighting, smooth seamless floor, trendy DTC modern brand aesthetic."
};

export const PRESET_ICONS: Record<PresetStyle, LucideIcon> = {
  Amazon: ShoppingBag,
  Meesho: Globe,
  Lifestyle: Camera,
  Premium: Star,
  Minimalist: Zap,
  "Studio Podium": Layers,
  "Marble Luxury": Sparkles,
  "Outdoor Nature": Leaf,
  "Artisan Wood": Coffee,
  "Kitchen & Home": Home,
  "Neon Cyber": Cpu,
  "Hero Showcase": Award,
  "Pastel Studio": Palette
};

export const ASPECT_RATIOS = [
  { label: '1:1 Square', value: AspectRatio.SQUARE },
  { label: '3:4 Portrait', value: AspectRatio.PORTRAIT },
  { label: '4:3 Landscape', value: AspectRatio.LANDSCAPE },
  { label: '9:16 Story', value: AspectRatio.TALL },
  { label: 'Custom', value: AspectRatio.CUSTOM },
];
