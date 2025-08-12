import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const LoginButton = () => {
  const { isInitialized, isAuthAvailable } = useAuth();
  const { theme } = useTheme();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only attempt to render the Google button if auth is available and initialized.
    if (isAuthAvailable && isInitialized && buttonRef.current && window.google) {
        window.google.accounts.id.renderButton(
            buttonRef.current,
            { theme: theme === 'dark' ? 'filled_black' : 'outline', size: "medium", shape: "pill" }
        );
    }
  }, [isInitialized, theme, isAuthAvailable]);

  // If auth is not configured, show a disabled button with a tooltip.
  if (!isAuthAvailable) {
    return (
        <div 
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 dark:text-gray-400 dark:bg-gray-700 rounded-full cursor-not-allowed"
          title="Google Sign-In is not configured for this application."
        >
          Sign In
        </div>
    );
  }

  // While waiting for the Google script to initialize, show a placeholder.
  if (!isInitialized) {
    return <div className="w-[90px] h-[36px] bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>;
  }
  
  // Render the target div for the Google button.
  return <div ref={buttonRef} />;
};