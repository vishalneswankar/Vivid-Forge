
import React from 'react';

export const AdBanner = () => {
  return (
    <div className="w-full max-w-lg mx-auto my-8 p-2 bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Ad</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">This is a placeholder for a banner ad.</p>
      </div>
    </div>
  );
};
