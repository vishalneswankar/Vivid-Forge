

import React from 'react';
import type { Wallpaper } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { HeartIcon } from './icons/HeartIcon';
import { WallpaperIcon } from './icons/WallpaperIcon';
import { useAd } from '../contexts/AdContext';

interface WallpaperCardProps {
  wallpaper: Omit<Wallpaper, 'type'>;
  isFavorite: boolean;
  onToggleFavorite: (wallpaper: Omit<Wallpaper, 'type'>) => void;
  onSetWallpaper: (wallpaper: Omit<Wallpaper, 'type'>) => void;
}

export const WallpaperCard = ({ wallpaper, isFavorite, onToggleFavorite, onSetWallpaper }: WallpaperCardProps) => {
  const { showInterstitialAd } = useAd();

  const handleDownload = () => {
    const downloadAction = () => {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${wallpaper.base64Image}`;
      link.download = `${wallpaper.prompt.replace(/\s+/g, '_').slice(0, 30)}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    showInterstitialAd(downloadAction);
  };

  const aspectRatioClass = {
    '9:16': 'aspect-[9/16]',
    '16:9': 'aspect-[16/9]',
    '1:1': 'aspect-square',
  }[wallpaper.aspectRatio] || 'aspect-[9/16]';


  return (
    <div className={`relative group overflow-hidden rounded-3xl shadow-lg w-full max-w-sm mx-auto bg-gray-200 dark:bg-gray-800 ${aspectRatioClass}`}>
      <img
        src={`data:image/jpeg;base64,${wallpaper.base64Image}`}
        alt={wallpaper.prompt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="font-sans text-sm truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">{wallpaper.prompt}</p>
        <div className="flex justify-end items-center gap-2 mt-2">
           <button
            onClick={() => onToggleFavorite(wallpaper)}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors text-pink-400"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
           >
            <HeartIcon filled={isFavorite} className="w-6 h-6" />
          </button>
          <button
            onClick={() => onSetWallpaper(wallpaper)}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Set as wallpaper"
           >
            <WallpaperIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Download wallpaper"
          >
            <DownloadIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};