import React from 'react';
import { Settings2, Wand2 } from 'lucide-react';
import { GenerationSettings, PresetStyle, AspectRatio } from '../types';
import { PRESET_ICONS, PRESET_PROMPTS, ASPECT_RATIOS } from '../constants';

interface PromptControlsProps {
  settings: GenerationSettings;
  onChange: (newSettings: GenerationSettings) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onStop: () => void;
  hasImage: boolean;
}

export const PromptControls: React.FC<PromptControlsProps> = ({ 
  settings, 
  onChange, 
  isGenerating, 
  onGenerate,
  onStop,
  hasImage 
}) => {
  
  const handlePresetClick = (preset: PresetStyle) => {
    // If clicking active preset, deselect it. Otherwise select it.
    const newPreset = settings.preset === preset ? null : preset;
    // If selecting a preset, also update the custom prompt text for visibility
    const newPrompt = newPreset ? PRESET_PROMPTS[newPreset] : '';
    
    onChange({
      ...settings,
      preset: newPreset,
      customPrompt: newPrompt
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Aspect Ratio Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Image Dimensions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => onChange({ ...settings, aspectRatio: ratio.value })}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-all
                ${settings.aspectRatio === ratio.value 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Styles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Style Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESET_PROMPTS) as PresetStyle[]).map((style) => {
            const Icon = PRESET_ICONS[style];
            const isActive = settings.preset === style;
            return (
              <button
                key={style}
                onClick={() => handlePresetClick(style)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border
                  ${isActive 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Prompt <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={settings.customPrompt}
          onChange={(e) => onChange({ ...settings, customPrompt: e.target.value, preset: null })} // Clear preset if user types manually
          placeholder="e.g. White background, soft studio lighting, premium look..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24 text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {isGenerating ? (
          <button
            onClick={onStop}
            className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 active:scale-[0.99]"
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Stop Generation
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={!hasImage}
            className={`
              w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3
              ${!hasImage 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25 active:scale-[0.99]'
              }
            `}
          >
            <Wand2 className="w-5 h-5" />
            Generate Images
          </button>
        )}
      </div>
    </div>
  );
};
