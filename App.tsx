import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptControls } from './components/PromptControls';
import { ImageGallery } from './components/ImageGallery';
import { GeneratedImage, GenerationSettings, AspectRatio } from './types';
import { generateProductImage } from './services/geminiService';
import { resizeImage } from './utils/fileUtils';
import { Sparkles, Camera, AlertCircle } from 'lucide-react';

const App = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    customPrompt: '',
    preset: null,
    aspectRatio: AspectRatio.SQUARE,
    customWidth: '1080',
    customHeight: '1080'
  });

  const handleStop = () => {
    setShouldStop(true);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setShouldStop(false);
    setError(null);
    setGeneratedImages([]); // Clear previous results

    const promptToUse = settings.customPrompt.trim() || "Professional product photography, studio lighting, high resolution, 4k, clean background";

    let customW = 1024;
    let customH = 1024;

    if (settings.aspectRatio === AspectRatio.CUSTOM) {
        customW = parseInt(settings.customWidth || '1024', 10) || 1024;
        customH = parseInt(settings.customHeight || '1024', 10) || 1024;
    } else if (settings.aspectRatio === AspectRatio.PORTRAIT) {
        customW = 768;
        customH = 1024;
    } else if (settings.aspectRatio === AspectRatio.LANDSCAPE) {
        customW = 1024;
        customH = 768;
    } else if (settings.aspectRatio === AspectRatio.TALL) {
        customW = 576;
        customH = 1024;
    }
    
    // Resize/pad the input image before sending to Gemini, so Gemini fills the padding
    let paddedImage = selectedImage;
    try {
        paddedImage = await resizeImage(selectedImage, customW, customH);
    } catch (e) {
        console.error("Failed to pad image:", e);
    }

    // Execute requests sequentially to avoid hitting Gemini API rate limits (429 Resource Exhausted)
    const TARGET_COUNT = 4;
    
    for (let i = 0; i < TARGET_COUNT; i++) {
        // Check if we should stop before each request
        if (shouldStop) break;

        try {
            let url = await generateProductImage({
                imageBase64: paddedImage,
                prompt: promptToUse,
                aspectRatio: settings.aspectRatio
            });
            
            // Check again after the request in case it was stopped during the wait
            if (shouldStop) break;

            if (url) {
                const newImage: GeneratedImage = {
                    id: Math.random().toString(36).substr(2, 9),
                    url,
                    promptUsed: promptToUse,
                    createdAt: Date.now()
                };
                // Add image to state immediately as it becomes available
                setGeneratedImages(prev => [...prev, newImage]);
            }
        } catch (e: any) {
            console.error(`Generation ${i + 1} failed`, e);
            const errorMessage = e?.message || '';
            if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                setError("API quota exceeded or rate limit reached. Please check your Gemini API plan and billing details.");
                break; // Stop trying to generate more if we hit a rate limit/quota
            } else if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('UNKNOWN') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('xhr error')) {
                setError(`API Service Error: ${errorMessage || 'Unknown error'}`);
                break; // Stop on backend/proxy failures
            } else {
                setError(`Generation failed: ${errorMessage || 'Unknown error'}`);
                // Continue to next attempt for other potential transient errors
            }
        }

        // Add a small delay between requests to be respectful of rate limits,
        // unless it's the last request.
        if (i < TARGET_COUNT - 1) {
            // Use a promise that can be "interrupted" or just check shouldStop after the wait
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
    }
    
    setIsGenerating(false);
    setShouldStop(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              EcomLens AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 hidden sm:inline-block">Powered by Gemini Flash</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Input Source
              </h2>
              <ImageUploader 
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                  onClear={() => {
                      setSelectedImage(null);
                      setGeneratedImages([]);
                      setError(null);
                  }}
              />
            </div>

            <PromptControls 
              settings={settings}
              onChange={setSettings}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              onStop={handleStop}
              hasImage={!!selectedImage}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {generatedImages.length > 0 || isGenerating ? (
              <ImageGallery images={generatedImages} isGenerating={isGenerating} />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create?</h3>
                  <p className="max-w-md mx-auto">Upload a product photo and select a style to generate professional e-commerce variations instantly.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;