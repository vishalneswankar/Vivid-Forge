
import React from 'react';

export const SparklesIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
    <path d="M4 4 L6 6" />
    <path d="M18 4 L16 6" />
    <path d="M4 20 L6 18" />
    <path d="M18 20 L16 18" />
  </svg>
);
