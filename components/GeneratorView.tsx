

import React, { useState, useCallback, useRef } from 'react';
import { generateWallpapers } from '../services/geminiService';
import type { Wallpaper, SourceImage, View } from '../types';
import { Loader } from './Loader';
import { WallpaperCard } from './WallpaperCard';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CameraModal } from './CameraModal';
import { useAd } from '../contexts/AdContext';


const STYLES = [
  "Photorealistic", "Anime", "Cyberpunk", "Fantasy Art", "Impressionism",
  "Minimalist", "Abstract", "Vintage", "3D Render", "Steampunk", 
  "Watercolor", "Gothic", "Pixel Art", "Art Deco"
];

const ASPECT_RATIOS = {
  'Portrait': '9:16',
  'Widescreen': '16:9',
  'Square': '1:1',
} as const;
type AspectRatioLabel = keyof typeof ASPECT_RATIOS;


const PROMPT_SUGGESTIONS = [
  "A majestic lion with a crown of stars, in a cosmic nebula.",
  "Bioluminescent mushrooms in an enchanted forest at night.",
  "A futuristic city skyline with flying cars during a neon-lit rain.",
  "A tranquil Japanese garden with a koi pond and cherry blossoms.",
  "Steampunk owl with intricate clockwork gears for feathers.",
  "An epic space battle between two fleets of starships.",
  "A cozy library in a treehouse, filled with ancient books.",
  "An underwater metropolis of crystal towers and glowing sea life.",
];

const InspirationSection = ({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) => (
  <div className="text-center w-full max-w-4xl">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Need some inspiration?</h2>
    <p className="text-gray-500 dark:text-gray-400 mb-6">Try one of these ideas or create your own masterpiece!</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PROMPT_SUGGESTIONS.slice(0, 4).map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelectPrompt(prompt)}
          className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 h-full"
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
);

interface GeneratorViewProps {
  favorites: Wallpaper[];
  onToggleFavorite: (wallpaper: Omit<Wallpaper, 'type'>) => void;
  onSetWallpaper: (wallpaper: Omit<Wallpaper, 'type'>) => void;
  onNavigate: (view: View) => void;
}

const ApiKeyError = ({ onNavigate }: { onNavigate: (view: View) => void }) => (
    <div className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-6 rounded-xl text-center max-w-md shadow-lg border border-red-200 dark:border-red-800">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Configuration Needed</h3>
        <p className="text-sm text-gray-800 dark:text-gray-300 mb-4">
            The AI service requires a Google AI API key. Please add it on the settings page to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
          >
              Go to Settings
          </button>
          <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
              Get an API Key
          </a>
        </div>
    </div>
);


export const GeneratorView = ({ favorites, onToggleFavorite, onSetWallpaper, onNavigate }: GeneratorViewProps) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioLabel>('Portrait');
  const [numImages, setNumImages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWallpapers, setGeneratedWallpapers] = useState<Omit<Wallpaper, 'type'>[]>([]);
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showInterstitialAd } = useAd();

  const handleGenerate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const generationLogic = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedWallpapers([]);

        try {
        const fullPrompt = `${selectedStyle} style, ${prompt}`;
        const selectedAspectRatio = ASPECT_RATIOS[aspectRatio];
        const wallpapers = await generateWallpapers(fullPrompt, numImages, selectedAspectRatio, negativePrompt, sourceImage);
        setGeneratedWallpapers(wallpapers);
        } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
        setIsLoading(false);
        }
    };
    
    showInterstitialAd(generationLogic);

  }, [prompt, isLoading, selectedStyle, numImages, sourceImage, aspectRatio, negativePrompt, showInterstitialAd]);

  const handleSurpriseMe = () => {
    const randomPrompt = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
    setPrompt(randomPrompt);
  };
  
  const handleRandomStyle = () => {
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];
    setSelectedStyle(randomStyle);
  };

  const handleInspirationSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        setSourceImage({
          base64: base64String,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => setSourceImage(null);

  const handleCapture = (imageData: SourceImage) => {
    setSourceImage(imageData);
    setIsCameraOpen(false);
  }
  
  return (
    <div className="p-4 sm:p-6 flex flex-col items-center flex-grow">
       <div className="w-full max-w-2xl mx-auto my-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">1. Choose a Style</label>
            <button onClick={handleRandomStyle} disabled={isLoading} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50">Randomize</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(style => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                disabled={isLoading}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                  selectedStyle === style
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">2. Provide an Image (Optional)</label>
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
               <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                  <UploadIcon className="w-5 h-5"/>
                  Upload Image
               </button>
               <button type="button" onClick={() => setIsCameraOpen(true)} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                  <CameraIcon className="w-5 h-5"/>
                  Use Camera
               </button>
            </div>
          )}
        </div>


        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">3. Describe Your Vision</label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={sourceImage ? "e.g., turn this into a cyberpunk city" : "e.g., A bioluminescent forest"}
              className="w-full h-28 p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-gray-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="negative-prompt-input" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">4. Negative Prompt (Optional)</label>
            <textarea
              id="negative-prompt-input"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g., text, watermarks, ugly, blurry"
              className="w-full h-20 p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-gray-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">5. Choose Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
                {(Object.keys(ASPECT_RATIOS) as AspectRatioLabel[]).map(label => (
                <button
                    key={label}
                    type="button"
                    onClick={() => setAspectRatio(label)}
                    disabled={isLoading}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">Images:</span>
              {[1, 2, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumImages(num)}
                  disabled={isLoading}
                  className={`w-10 h-10 flex items-center justify-center font-bold rounded-lg transition-colors ${
                    numImages === num ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isLoading || !!sourceImage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <MagicWandIcon className="w-5 h-5" />
              Surprise Me
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:bg-purple-600/50 dark:disabled:bg-purple-800/50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
          >
            <SparklesIcon className="w-6 h-6"/>
            {isLoading ? 'Creating...' : `Generate ${numImages > 1 ? `${numImages} Images` : 'Image'}`}
          </button>
        </form>
      </div>
      
      {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}

      <div className="w-full flex-grow flex items-center justify-center p-4">
        {isLoading && <Loader />}
        {error && (
            error.includes("AI Service is not configured") 
            ? <ApiKeyError onNavigate={onNavigate} /> 
            : <div className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-xl text-center max-w-md">{error}</div>
        )}
        
        {!isLoading && !error && generatedWallpapers.length > 0 && (
          <div className="w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Your Creations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {generatedWallpapers.map(wallpaper => (
                  <WallpaperCard
                    key={wallpaper.id}
                    wallpaper={wallpaper}
                    isFavorite={favorites.some(fav => fav.id === wallpaper.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSetWallpaper={onSetWallpaper}
                  />
                ))}
            </div>
          </div>
        )}

        {!isLoading && !error && generatedWallpapers.length === 0 && (
           <InspirationSection onSelectPrompt={handleInspirationSelect} />
        )}
      </div>
    </div>
  );
};