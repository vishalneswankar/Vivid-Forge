

import React, { useState } from 'react';
import type { Video } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { HeartIcon } from './icons/HeartIcon';
import { CopyIcon } from './icons/CopyIcon';
import { useAd } from '../contexts/AdContext';

interface GeneratedVideoCardProps {
  video: Omit<Video, 'type'>;
  isFavorite: boolean;
  onToggleFavorite: (video: Video) => void;
}

export const GeneratedVideoCard = ({ video, isFavorite, onToggleFavorite }: GeneratedVideoCardProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const { showInterstitialAd } = useAd();

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(video.prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownload = () => {
        const downloadAction = async () => {
            try {
                const response = await fetch(video.url);
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${video.prompt.replace(/\s+/g, '_').slice(0, 30)}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error("Failed to download video:", error);
            }
        };
        showInterstitialAd(downloadAction);
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50">
            <div className={`relative max-w-sm mx-auto rounded-lg overflow-hidden shadow-md bg-black aspect-[${video.aspectRatio.replace(':', '/')}]`}>
                <video src={video.url} controls autoPlay loop className="w-full h-full object-contain" />
            </div>
            <div className="p-4 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">{video.prompt}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {video.aspectRatio}
                    </span>
                    {video.seed !== undefined && (
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Seed: {video.seed}
                        </span>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                     <button
                        onClick={handleCopyPrompt}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Copy prompt"
                    >
                        <CopyIcon className="w-4 h-4" />
                        {isCopied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <button
                        onClick={() => onToggleFavorite({ ...video, type: 'video' })}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-pink-500 rounded-xl hover:bg-pink-600 transition-colors"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <HeartIcon filled={isFavorite} className="w-5 h-5" />
                        {isFavorite ? 'Saved' : 'Save'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};