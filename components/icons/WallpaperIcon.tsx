
import React from 'react';

export const WallpaperIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 6h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
    <path d="M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M8 14l-2 2" />
  </svg>
);
