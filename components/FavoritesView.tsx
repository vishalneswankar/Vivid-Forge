

import React from 'react';
import type { FavoriteItem, Wallpaper, User, Video } from '../types';
import { WallpaperCard } from './WallpaperCard';
import { HeartIcon } from './icons/HeartIcon';
import { VideoCard } from './VideoCard';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  onToggleFavorite: (item: FavoriteItem) => void;
  onSetWallpaper: (wallpaper: Omit<Wallpaper, 'type'>) => void;
}

export const FavoritesView = ({ favorites, onToggleFavorite, onSetWallpaper }: FavoritesViewProps) => {
  return (
    <div className="p-4 sm:p-6 flex-grow">
      <div className="w-full max-w-md mx-auto text-center my-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Your Collection</h1>
        <p className="mt-2 text-purple-600 dark:text-purple-300">A collection of your saved masterpieces.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 mt-20">
            <HeartIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Collection is Empty</h2>
            <p>Create images and videos, and save your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {favorites.slice().reverse().map((item) => {
              if (item.type === 'image') {
                return (
                  <WallpaperCard
                      key={item.id}
                      wallpaper={item}
                      isFavorite={true}
                      onToggleFavorite={() => onToggleFavorite(item)}
                      onSetWallpaper={() => onSetWallpaper(item)}
                  />
                );
              }
              if (item.type === 'video') {
                return (
                  <VideoCard
                    key={item.id}
                    video={item}
                    isFavorite={true}
                    onToggleFavorite={() => onToggleFavorite(item)}
                  />
                )
              }
              return null;
            })}
        </div>
      )}
    </div>
  );
};
