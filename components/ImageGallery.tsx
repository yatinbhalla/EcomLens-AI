import React from 'react';
import { Download, Share2, Package } from 'lucide-react';
import { GeneratedImage } from '../types';
import { downloadImage, downloadAllAsZip } from '../utils/fileUtils';

interface ImageGalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  targetCount?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, isGenerating, targetCount = 4 }) => {
  
  // Show skeletons for the remaining expected images
  const totalExpected = targetCount;
  const skeletonCount = isGenerating ? Math.max(0, totalExpected - images.length) : 0;

  if (images.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600" />
          Generated Results {images.length > 0 && <span className="text-base font-normal text-gray-500">({images.length})</span>}
        </h2>
        
        {images.length > 0 && !isGenerating && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                images.forEach((img, idx) => {
                  setTimeout(() => {
                    downloadImage(img.url, `ecomlens_variant_${idx+1}.png`);
                  }, idx * 250); // Small delay to prevent browser from blocking multiple rapid downloads
                });
              }}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
            <button 
              onClick={() => downloadAllAsZip(images)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <Package className="w-4 h-4" />
              Download ZIP
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Render Actual Images */}
        {images.map((img, idx) => (
          <div key={img.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-1">
              <img 
                src={img.url} 
                alt={`Generated variant ${idx + 1}`} 
                className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
               <div>
                 <span className="text-xs font-semibold text-gray-700">Variant {idx + 1}</span>
                 <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{img.promptUsed}</p>
               </div>
               <div className="flex items-center gap-1">
                 <button 
                   onClick={() => downloadImage(img.url, `ecomlens_variant_${idx+1}.png`)}
                   className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                   title="Download image"
                 >
                   <Download className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        ))}

        {/* Render Skeletons for pending images */}
        {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={`skel-${images.length + i}`} className="aspect-square bg-gray-100 rounded-xl animate-pulse border border-gray-200 overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                    <span className="text-xs font-medium">Generating variant {images.length + i + 1}...</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};