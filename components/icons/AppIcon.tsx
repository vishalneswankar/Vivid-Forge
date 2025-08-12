
import React from 'react';

export const AppIcon = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="appIconGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7"/>
        <stop offset="1" stopColor="#EC4899"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Main Crystal shape with glow */}
    <g filter="url(#glow)">
      <path
        d="M50 15 L85 40 L50 90 L15 40 Z"
        fill="url(#appIconGradient)"
        stroke="#fff"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      {/* Facet lines */}
      <path d="M50 15 L50 90" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M15 40 L85 40" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M50 15 L30 40" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M50 15 L70 40" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M30 40 L50 90" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M70 40 L50 90" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" />
    </g>

    {/* Little sparkles */}
    <path d="M10 10 L15 20 L5 20 Z" fill="white" opacity="0.8" />
    <path d="M90 60 L85 70 L95 70 Z" fill="white" opacity="0.8" />
    <circle cx="80" cy="15" r="3" fill="white" />
  </svg>
);
