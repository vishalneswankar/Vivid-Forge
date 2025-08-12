import React from 'react';

export const MagicWandIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
    <path d="M15 4V2" />
    <path d="M15 10V8" />
    <path d="M12.5 6.5L14 5" />
    <path d="M12.5 11.5L14 13" />
    <path d="M10 4h.01" />
    <path d="M5 4h.01" />
    <path d="M7.5 6.5L6 5" />
    <path d="M2.49 15.51a4 4 0 0 0 5.66 5.66l1-1L4.5 17.5l-2.01 2.01Z" />
    <path d="m21.5 2.5-5.5 5.5" />
    <path d="m13.5 12.5 5.5-5.5" />
  </svg>
);
