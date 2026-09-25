import React, { useState, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptControls } from './components/PromptControls';
import { ImageGallery } from './components/ImageGallery';
import { GeneratedImage, GenerationSettings, AspectRatio } from './types';
import { generateProductImage, GeminiApiErrorInfo } from './services/geminiService';
import { optimizeReferenceImage, resizeImage } from './utils/fileUtils';
import { Sparkles, Camera, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const App = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [settings, setSettings] = useState<GenerationSettings>({
    customPrompt: '',
    preset: null,
    aspectRatio: AspectRatio.SQUARE,
    customWidth: '1080',
    customHeight: '1080',
    variantCount: 4,
  });

  const shouldStopRef = useRef(false);

  // Handle countdown timer for API quota cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleStop = () => {
    shouldStopRef.current = true;
    setGenerationStatus('Stopping generation...');
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    if (cooldownRemaining > 0) {
      setError(`API quota is refreshing. Please wait ${cooldownRemaining}s before requesting new generations.`);
      return;
    }

    setIsGenerating(true);
    shouldStopRef.current = false;
    setError(null);
    setGeneratedImages([]); // Clear previous results
    setGenerationStatus('Preparing product image...');

    const promptToUse = settings.customPrompt.trim() || "Professional commercial product photography, studio lighting, ultra high resolution, clean elegant background";

    let customW = 1024;
    let customH = 1024;
    if (settings.aspectRatio === AspectRatio.CUSTOM) {
      customW = parseInt(settings.customWidth || '1024', 10) || 1024;
      customH = parseInt(settings.customHeight || '1024', 10) || 1024;
    }

    // Optimize reference image: maintains 100% full product image (NO CROPPING)
    // and bounds max dimension to minimize token consumption and avoid 429 quota exhaustion.
    let referenceImage = selectedImage;
    try {
      referenceImage = await optimizeReferenceImage(selectedImage, 768);
    } catch (e) {
      console.warn("Failed to optimize reference image, using original:", e);
    }

    const TARGET_COUNT = settings.variantCount ?? 4;
    
    for (let i = 0; i < TARGET_COUNT; i++) {
      if (shouldStopRef.current) {
        break;
      }

      // Add a small pacing delay between sequential requests to prevent hitting RPM limits
      if (i > 0) {
        setGenerationStatus(`Pacing requests... generating variant ${i + 1} of ${TARGET_COUNT}`);
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      if (shouldStopRef.current) break;

      setGenerationStatus(`Generating variant ${i + 1} of ${TARGET_COUNT}...`);

      let retryAttempt = 0;
      const MAX_RETRIES = 1;
      let success = false;

      while (!success && retryAttempt <= MAX_RETRIES) {
        try {
          let url = await generateProductImage({
            imageBase64: referenceImage,
            prompt: promptToUse,
            aspectRatio: settings.aspectRatio,
            customWidth: settings.customWidth,
            customHeight: settings.customHeight
          });

          if (shouldStopRef.current) break;

          if (url) {
            // If custom resolution requested, fit to specified pixel dimensions
            if (settings.aspectRatio === AspectRatio.CUSTOM && customW && customH) {
              try {
                url = await resizeImage(url, customW, customH, 'contain');
              } catch (resizeErr) {
                console.warn("Output resize error:", resizeErr);
              }
            }

            const newImage: GeneratedImage = {
              id: Math.random().toString(36).substring(2, 11),
              url,
              promptUsed: promptToUse,
              createdAt: Date.now()
            };
            setGeneratedImages(prev => [...prev, newImage]);
            success = true;
          }
        } catch (err: any) {
          console.error(`Generation variant ${i + 1} failed (attempt ${retryAttempt + 1}):`, err);
          const errorInfo = err as GeminiApiErrorInfo;
          const errorMsg = err?.message || '';
          const isQuota = errorInfo?.isQuotaError || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
          const retryDelay = errorInfo?.retryAfterSeconds || 0;

          // If brief cooldown suggested by API and we haven't retried yet, auto-retry after waiting
          if (isQuota && retryDelay > 0 && retryDelay <= 8 && retryAttempt < MAX_RETRIES && !shouldStopRef.current) {
            retryAttempt++;
            setGenerationStatus(`API rate limit hit. Pausing ${retryDelay}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, (retryDelay + 1) * 1000));
            continue;
          }

          // Handle quota / rate exhaustion
          if (isQuota) {
            const cooldown = retryDelay > 0 ? retryDelay : 45;
            setCooldownRemaining(cooldown);
            setError(
              `API rate limit reached (input token quota). Ready to generate again in ${cooldown} seconds. ` +
              (i > 0 ? `${i} variant${i > 1 ? 's were' : ' was'} successfully created and saved below!` : '')
            );
            shouldStopRef.current = true;
            break;
          } else {
            setError(`Generation error: ${errorMsg || 'Failed to complete generation'}`);
            break;
          }
        }
      }

      if (shouldStopRef.current) break;
    }

    setIsGenerating(false);
    setGenerationStatus('');
    shouldStopRef.current = false;
  };

  const targetCount = settings.variantCount ?? 4;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              EcomLens AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 hidden sm:inline-block">Commercial Product Photography</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Cooldown / Rate Limit Banner */}
        {cooldownRemaining > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Gemini API Rate Limit Cooldown Active</p>
                <p className="text-xs text-amber-700">Token quota is replenishing. Ready to generate more variants shortly.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-amber-900">{cooldownRemaining}s</span>
            </div>
          </div>
        )}

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
                onImageSelect={(img) => {
                  setSelectedImage(img);
                  setError(null);
                }}
                onClear={() => {
                  setSelectedImage(null);
                  setGeneratedImages([]);
                  setError(null);
                  setGenerationStatus('');
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
                <div className="text-sm flex-1">
                  <p>{error}</p>
                </div>
              </div>
            )}

            {isGenerating && generationStatus && (
              <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 flex items-center gap-3 text-sm">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span>{generationStatus}</span>
              </div>
            )}

            {generatedImages.length > 0 || isGenerating ? (
              <ImageGallery 
                images={generatedImages} 
                isGenerating={isGenerating} 
                targetCount={targetCount}
              />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create?</h3>
                <p className="max-w-md mx-auto">Upload a product photo and select a style preset to generate studio-quality commercial variations.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;