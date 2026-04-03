import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptControls } from './components/PromptControls';
import { ImageGallery } from './components/ImageGallery';
import { GeneratedImage, GenerationSettings, AspectRatio } from './types';
import { generateProductImage } from './services/geminiService';
import { Sparkles, Camera } from 'lucide-react';

const App = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    customPrompt: '',
    preset: null,
    aspectRatio: AspectRatio.SQUARE
  });

  const handleStop = () => {
    setShouldStop(true);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setShouldStop(false);
    setGeneratedImages([]); // Clear previous results

    const promptToUse = settings.customPrompt.trim() || "Professional product photography, studio lighting, high resolution, 4k, clean background";

    // Execute requests sequentially to avoid hitting Gemini API rate limits (429 Resource Exhausted)
    const TARGET_COUNT = 4;
    
    for (let i = 0; i < TARGET_COUNT; i++) {
        // Check if we should stop before each request
        if (shouldStop) break;

        try {
            const url = await generateProductImage({
                imageBase64: selectedImage,
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
        } catch (e) {
            console.error(`Generation ${i + 1} failed`, e);
            // Continue to next attempt even if one fails
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