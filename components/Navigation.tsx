
import React from 'react';
import type { View } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { HeartIcon } from './icons/HeartIcon';
import { VideoIcon } from './icons/VideoIcon';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

interface NavButtonProps {
  targetView: View;
  currentView: View;
  onNavigate: (view: View) => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton = ({ targetView, currentView, onNavigate, icon, label }: NavButtonProps) => {
    const isActive = currentView === targetView;
    return (
      <button
        onClick={() => onNavigate(targetView)}
        className={`flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
          isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon}
        <span className="text-xs font-medium mt-1">{label}</span>
      </button>
    );
};

export const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  return (
    <footer className="shrink-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50">
      <nav className="flex justify-around items-center h-16">
        <NavButton
            targetView="generator"
            currentView={currentView}
            onNavigate={onNavigate}
            icon={<SparklesIcon className={currentView === 'generator' ? 'w-7 h-7' : 'w-6 h-6'} />}
            label="Wallpaper"
        />
        <NavButton
            targetView="video"
            currentView={currentView}
            onNavigate={onNavigate}
            icon={<VideoIcon className={currentView === 'video' ? 'w-7 h-7' : 'w-6 h-6'} />}
            label="Video"
        />
        <NavButton
            targetView="favorites"
            currentView={currentView}
            onNavigate={onNavigate}
            icon={<HeartIcon filled={currentView === 'favorites'} className={currentView === 'favorites' ? 'w-7 h-7 text-purple-600 dark:text-purple-400' : 'w-6 h-6'} />}
            label="Collection"
        />
      </nav>
    </footer>
  );
};
