import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { fileToBase64 } from '../utils/fileUtils';

interface ImageUploaderProps {
  selectedImage: string | null;
  onImageSelect: (base64: string) => void;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ selectedImage, onImageSelect, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file);
          onImageSelect(base64);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [onImageSelect]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        onImageSelect(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full max-w-sm mx-auto aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
        <img src={selectedImage} alt="Product Preview" className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onClear}
            className="bg-white/90 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-white flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Remove Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-sm mx-auto aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-6 cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}
      `}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
        <Upload className="w-8 h-8" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Product Photo</h3>
      <p className="text-sm text-gray-500 mb-4">Drag & drop or click to browse</p>
      
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
        <ImageIcon className="w-3 h-3" />
        <span>Supports JPG, PNG</span>
      </div>
    </div>
  );
};
