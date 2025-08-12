

import React from 'react';
import type { Wallpaper } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { useAd } from '../contexts/AdContext';

interface SetWallpaperModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
}

export const SetWallpaperModal = ({ wallpaper, onClose }: SetWallpaperModalProps) => {
  const { showInterstitialAd } = useAd();

  if (!wallpaper) return null;

  const handleDownload = () => {
    const downloadAction = () => {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${wallpaper.base64Image}`;
      link.download = `${wallpaper.prompt.replace(/\s+/g, '_').slice(0, 30)}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    };
    showInterstitialAd(downloadAction);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl text-gray-900 dark:text-white">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">Set as Wallpaper</h2>
            <button onClick={onClose} className="p-1 -m-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Close">
              <XCircleIcon className="w-8 h-8"/>
            </button>
          </div>
          
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            To set this image as your wallpaper, please follow these steps:
          </p>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Download the image to your device.</li>
            <li>Open your device's <strong>Photos</strong> or <strong>Gallery</strong> app.</li>
            <li>Find the downloaded image.</li>
            <li>Use the 'Set as Wallpaper' option in the image menu.</li>
          </ol>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
            aria-label="Download wallpaper"
          >
            <DownloadIcon className="w-5 h-5" />
            Download Image
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};