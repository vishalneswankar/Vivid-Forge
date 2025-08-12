
import React, { useState, useCallback } from 'react';
import type { View, Wallpaper, FavoriteItem, Video } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GeneratorView } from './components/GeneratorView';
import { FavoritesView } from './components/FavoritesView';
import { VideoView } from './components/VideoView';
import { useTheme } from './contexts/ThemeContext';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { BackgroundSlideshow } from './components/BackgroundSlideshow';
import { SetWallpaperModal } from './components/SetWallpaperModal';
import { AppIcon } from './components/icons/AppIcon';
import { Navigation } from './components/Navigation';


const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </button>
  );
};


const App = () => {
  const [view, setView] = useState<View>('generator');
  const storageKey = 'creative-suite-favorites';
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>(storageKey, []);
  const [wallpaperToSet, setWallpaperToSet] = useState<Wallpaper | null>(null);

  const handleToggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      const isFavorited = prev.some(fav => fav.id === item.id);
      if (isFavorited) {
        return prev.filter(fav => fav.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, [setFavorites]);

  // This wrapper is needed because GeneratorView's onToggleFavorite provides an object without the 'type' property.
  const handleToggleWallpaperFromGenerator = useCallback((item: Omit<Wallpaper, 'type'>) => {
    handleToggleFavorite({ ...item, type: 'image' });
  }, [handleToggleFavorite]);

  const handleOpenSetWallpaperModal = useCallback((wallpaper: Omit<Wallpaper, 'type'>) => {
    setWallpaperToSet({ ...wallpaper, type: 'image' });
  }, []);

  const handleCloseSetWallpaperModal = useCallback(() => {
    setWallpaperToSet(null);
  }, []);
  
  const imageFavorites = favorites.filter(f => f.type === 'image') as Wallpaper[];
  const videoFavorites = favorites.filter(f => f.type === 'video') as Video[];

  return (
    <>
      <BackgroundSlideshow />
      <div className="flex flex-col h-screen max-h-screen w-full max-w-5xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg text-gray-900 dark:text-white font-sans transition-colors duration-300">
        <header className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <AppIcon className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">
              Vivid Forge
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col">
          {view === 'generator' && <GeneratorView favorites={imageFavorites} onToggleFavorite={handleToggleWallpaperFromGenerator} onSetWallpaper={handleOpenSetWallpaperModal} />}
          {view === 'video' && <VideoView favorites={videoFavorites} onToggleFavorite={handleToggleFavorite as (video: Video) => void} />}
          {view === 'favorites' && <FavoritesView favorites={favorites} onToggleFavorite={handleToggleFavorite} onSetWallpaper={handleOpenSetWallpaperModal} />}
        </main>
        
        <Navigation currentView={view} onNavigate={setView} />
      </div>
      {wallpaperToSet && <SetWallpaperModal wallpaper={wallpaperToSet} onClose={handleCloseSetWallpaperModal} />}
    </>
  );
};

export default App;