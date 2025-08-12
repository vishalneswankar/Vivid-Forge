/**
 * This file centralizes configuration variables for the application.
 * It reads keys from localStorage for local development, and falls back to 
 * environment variables for production deployments. This provides an easy way
 * to configure the app via the Settings UI without needing a .env file.
 */

const CONFIG_STORAGE_KEY = 'vivid-forge-config';

interface AppConfig {
    apiKey: string;
    googleClientId: string;
    googleAdsenseClientId: string;
    googleAdsenseInterstitialAdUnitId: string;
}

// Function to get the current config from localStorage or env vars
export const getConfig = (): AppConfig => {
    const fromLocalStorage = localStorage.getItem(CONFIG_STORAGE_KEY);
    const localConfig: Partial<AppConfig> = fromLocalStorage ? JSON.parse(fromLocalStorage) : {};

    // For each key, use the value from localStorage, or fall back to the environment variable.
    return {
        apiKey: localConfig.apiKey || process.env.API_KEY || '',
        googleClientId: localConfig.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
        googleAdsenseClientId: localConfig.googleAdsenseClientId || process.env.GOOGLE_ADSENSE_CLIENT_ID || '',
        googleAdsenseInterstitialAdUnitId: localConfig.googleAdsenseInterstitialAdUnitId || process.env.GOOGLE_ADSENSE_INTERSTITIAL_AD_UNIT_ID || '',
    };
};

// Function to save config to localStorage
export const saveConfig = (newConfig: Partial<AppConfig>) => {
    const currentConfig = getConfig();
    const mergedConfig = { ...currentConfig, ...newConfig };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(mergedConfig));
    // Dispatch a custom event to notify the app that the configuration has changed.
    // This allows components like the AuthProvider to re-initialize if keys are added.
    window.dispatchEvent(new Event('config-updated'));
};

// Functions to check if features are configured and available.
export const isGoogleAuthAvailable = () => !!getConfig().googleClientId;
export const isGoogleAdSenseAvailable = () => !!getConfig().googleAdsenseClientId && !!getConfig().googleAdsenseInterstitialAdUnitId;
export const isAiServiceAvailable = () => !!getConfig().apiKey;
