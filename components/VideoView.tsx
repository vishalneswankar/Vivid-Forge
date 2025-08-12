

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateVideo, getVideoOperationStatus } from '../services/geminiService';
import type { SourceImage, Video } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CameraModal } from './CameraModal';
import { VideoIcon } from './icons/VideoIcon';
import { GeneratedVideoCard } from './GeneratedVideoCard';
import { useAd } from '../contexts/AdContext';


const ASPECT_RATIOS = {
  'Portrait': '9:16',
  'Landscape': '16:9',
  'Square': '1:1',
} as const;
type AspectRatioLabel = keyof typeof ASPECT_RATIOS;

const loadingMessages = [
    "Warming up the video synthesizer...",
    "Directing a digital dream...",
    "This can take a few minutes, time for a coffee?",
    "Rendering frames, one by one...",
    "Choreographing pixels into motion...",
    "The AI director is calling 'Action!'...",
    "Almost there, adding the final touches...",
];

const PROMPT_SUGGESTIONS = [
    "A time-lapse of a city from day to night.",
    "A cat playfully chasing a laser dot.",
    "Ocean waves crashing on a sandy beach in slow motion.",
    "A flower blooming in hyper-speed.",
];

const getFriendlyErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const errorMessage = error.message;

        // Check for the specific quota error message from the API
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('exceeded your current quota')) {
            return "You've exceeded your usage quota. Please check your API plan and billing details with Google AI, and try again later.";
        }

        // Try to parse for a cleaner message for other API errors
        try {
            const errorObj = JSON.parse(errorMessage);
            if (errorObj.error && errorObj.error.message) {
                return `API Error: ${errorObj.error.message}`;
            }
        } catch (e) {
            // Not a JSON error, fall through to return the raw message.
        }

        // For other errors, return the message directly.
        return errorMessage;
    }
    return 'An unknown error occurred. Please try again.';
};

const VideoLoader = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);
    
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
            <p className="text-gray-900 dark:text-white mt-4 text-lg font-semibold">{message}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Please keep this page open.</p>
        </div>
    );
};

interface VideoViewProps {
    favorites: Video[];
    onToggleFavorite: (video: Video) => void;
}

export const VideoView = ({ favorites, onToggleFavorite }: VideoViewProps) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioLabel>('Portrait');
  const [seed, setSeed] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<Omit<Video, 'type'>[]>([]);
  const { showInterstitialAd } = useAd();

  const cleanupPolling = () => {
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return cleanupPolling;
  }, []);

  const handleGenerate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const generationLogic = async () => {
        setIsLoading(true);
        setError(null);
        cleanupPolling();

        try {
            const selectedAspectRatio = ASPECT_RATIOS[aspectRatio];
            const numericSeed = seed ? parseInt(seed, 10) : undefined;
            let operation = await generateVideo(prompt, selectedAspectRatio, sourceImage, numericSeed);

            pollIntervalRef.current = window.setInterval(async () => {
                try {
                    operation = await getVideoOperationStatus(operation);

                    if (operation.done) {
                        cleanupPolling();
                        setIsLoading(false);
                        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            
                            const newVideo: Omit<Video, 'type'> = { 
                                id: new Date().toISOString(),
                                url, 
                                prompt,
                                aspectRatio: selectedAspectRatio,
                                seed: numericSeed,
                            };
                            setGeneratedVideos(prev => [newVideo, ...prev]);

                        } else {
                            const opError = operation.error;
                            let finalErrorMessage = 'Video generation finished, but no video was returned. The prompt may have been blocked.';
                            if (opError && opError.message) {
                               if (String(opError.message).includes('quota') || String(opError.message).includes('RESOURCE_EXHAUSTED')) {
                                     finalErrorMessage = "You've exceeded your usage quota. Please check your API plan and billing details with Google AI, and try again later.";
                                } else {
                                    finalErrorMessage = `Generation failed: ${opError.message}`;
                                }
                            }
                            setError(finalErrorMessage);
                        }
                    }
                } catch (pollError) {
                     setError(getFriendlyErrorMessage(pollError));
                     cleanupPolling();
                     setIsLoading(false);
                }
            }, 10000);

        } catch (err) {
            setError(getFriendlyErrorMessage(err));
            setIsLoading(false);
            cleanupPolling();
        }
    };

    showInterstitialAd(generationLogic);

  }, [prompt, isLoading, aspectRatio, sourceImage, seed, showInterstitialAd]);
  
  const handleInspirationSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    document.getElementById('prompt-input-video')?.focus();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        setSourceImage({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => setSourceImage(null);

  const handleCapture = (imageData: SourceImage) => {
    setSourceImage(imageData);
    setIsCameraOpen(false);
  };
  
  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center flex-grow">
        {isLoading ? (
            <div className="flex-grow flex items-center justify-center"><VideoLoader /></div>
        ) : (
            <div className="w-full flex-grow">
                {error && (
                    <div className="w-full max-w-2xl mx-auto my-4">
                        <div className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-xl text-center">{error}</div>
                    </div>
                )}
                
                {generatedVideos.length > 0 && (
                    <div className="w-full max-w-2xl mx-auto my-8 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Generation History</h2>
                        {generatedVideos.map(video => (
                            <GeneratedVideoCard 
                                key={video.id}
                                video={video}
                                isFavorite={favorites.some(fav => fav.id === video.id)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                        <hr className="border-gray-200 dark:border-gray-700" />
                    </div>
                )}

                <div className="w-full max-w-2xl mx-auto my-8 space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {generatedVideos.length > 0 ? 'Create Another Video' : 'Create a New Video'}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">Describe your vision and set the options.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">1. Provide an Image (Optional)</label>
                      {sourceImage ? (
                        <div className="relative group w-48 mx-auto">
                          <img src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`} alt="Source preview" className="rounded-xl shadow-lg" />
                          <button 
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 p-1 bg-gray-800 text-white rounded-full hover:bg-red-600 transition-colors opacity-50 group-hover:opacity-100"
                            aria-label="Remove image"
                            >
                            <XCircleIcon className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <UploadIcon className="w-5 h-5"/>
                              Upload Image
                           </button>
                           <button type="button" onClick={() => setIsCameraOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <CameraIcon className="w-5 h-5"/>
                              Use Camera
                           </button>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-4">
                      <div>
                        <label htmlFor="prompt-input-video" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">2. Describe The Video</label>
                        <textarea
                            id="prompt-input-video"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={sourceImage ? "e.g., make this character wink and smile" : "e.g., a time-lapse of a blooming flower"}
                            className="w-full h-28 p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-gray-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">3. Seed (Optional)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number"
                                    value={seed}
                                    onChange={(e) => setSeed(e.target.value)}
                                    placeholder="e.g. 42"
                                    className="w-full p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button type="button" onClick={handleRandomizeSeed} className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Random
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">4. Choose Aspect Ratio</label>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(ASPECT_RATIOS) as AspectRatioLabel[]).map(label => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setAspectRatio(label)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                                    aspectRatio === label
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {label} ({ASPECT_RATIOS[label]})
                                </button>
                                ))}
                            </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!prompt.trim()}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:bg-purple-600/50 dark:disabled:bg-purple-800/50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                      >
                        <VideoIcon className="w-6 h-6"/>
                        Generate Video
                      </button>
                    </form>

                     <div className="text-center w-full max-w-4xl pt-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Need some inspiration?</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Try one of these video ideas!</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {PROMPT_SUGGESTIONS.map((p, i) => (
                            <button
                              key={i}
                              onClick={() => handleInspirationSelect(p)}
                              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 h-full"
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      
      {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};