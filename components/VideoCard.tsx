

import React, { useRef, useState } from 'react';
import type { Video, FavoriteItem } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { HeartIcon } from './icons/HeartIcon';
import { CopyIcon } from './icons/CopyIcon';
import { useAd } from '../contexts/AdContext';

interface VideoCardProps {
  video: Video;
  isFavorite: boolean;
  onToggleFavorite: (video: FavoriteItem) => void;
}

export const VideoCard = ({ video, isFavorite, onToggleFavorite }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { showInterstitialAd } = useAd();

  const handleDownload = () => {
    const downloadAction = async () => {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${video.prompt.replace(/\s+/g, '_').slice(0, 30)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    };
    showInterstitialAd(downloadAction);
  };

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(console.error);
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }
  };
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(video.prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div 
        className="relative group overflow-hidden rounded-3xl shadow-lg w-full max-w-sm mx-auto bg-gray-900"
        style={{ aspectRatio: video.aspectRatio.replace(':', ' / ')}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={video.url}
        loop
        muted
        playsInline
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="font-sans text-sm truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">{video.prompt}</p>
        <div className="flex justify-end items-center gap-2 mt-2">
           <button
            onClick={handleCopyPrompt}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center"
            style={{ width: '44px', height: '44px' }}
            aria-label="Copy prompt"
           >
            {isCopied ? <span className="text-xs">Copied!</span> : <CopyIcon className="w-5 h-5" />}
          </button>
           <button
            onClick={() => onToggleFavorite(video)}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors text-pink-400"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
           >
            <HeartIcon filled={isFavorite} className="w-6 h-6" />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Download video"
          >
            <DownloadIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};