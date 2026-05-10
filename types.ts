export interface GeneratedImage {
  id: string;
  url: string;
  blob?: Blob; // Store blob for zip download
  promptUsed: string;
  createdAt: number;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3',
  TALL = '9:16',
  CUSTOM = 'CUSTOM'
}

export type PresetStyle = 'Amazon' | 'Meesho' | 'Lifestyle' | 'Premium' | 'Minimalist';

export interface GenerationSettings {
  customPrompt: string;
  preset: PresetStyle | null;
  aspectRatio: AspectRatio;
  customWidth?: string;
  customHeight?: string;
}
