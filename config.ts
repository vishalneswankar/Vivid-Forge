/**
 * This file centralizes configuration variables for the application.
 * It reads environment variables and provides boolean flags to easily check
 * for feature availability.
 */

// We read the Google Client ID from environment variables.
// In a real-world build setup (like Vite or Create React App), this would be
// `import.meta.env.VITE_GOOGLE_CLIENT_ID` or `process.env.REACT_APP_GOOGLE_CLIENT_ID`.
// For this environment, we'll assume `process.env.GOOGLE_CLIENT_ID` is made available.
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// A flag to check anywhere in the app if Google Authentication is configured and available.
export const isGoogleAuthAvailable = !!GOOGLE_CLIENT_ID;

// Google AdSense Configuration
// IMPORTANT: Replace with your own AdSense Client ID and Ad Unit ID by setting environment variables.
export const GOOGLE_ADSENSE_CLIENT_ID = process.env.GOOGLE_ADSENSE_CLIENT_ID; // e.g., 'ca-pub-1234567890123456'
export const GOOGLE_ADSENSE_INTERSTITIAL_AD_UNIT_ID = process.env.GOOGLE_ADSENSE_INTERSTITIAL_AD_UNIT_ID; // e.g., '/6355419/Travel/Europe/France/Paris' or a numeric ID

// A flag to check if AdSense is configured and available.
export const isGoogleAdSenseAvailable = !!GOOGLE_ADSENSE_CLIENT_ID && !!GOOGLE_ADSENSE_INTERSTITIAL_AD_UNIT_ID;
