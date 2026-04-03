import JSZip from 'jszip';
import saveAs from 'file-saver';
import { GeneratedImage } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Return the full Data URL (e.g., "data:image/png;base64,...")
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

export const downloadAllAsZip = async (images: GeneratedImage[]) => {
  const zip = new JSZip();
  const folder = zip.folder("ecomlens_images");

  if (!folder) return;

  const promises = images.map(async (img, index) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      folder.file(`product_variant_${index + 1}.png`, blob);
    } catch (err) {
      console.error("Error zipping image", err);
    }
  });

  await Promise.all(promises);
  
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "ecomlens_product_images.zip");
};