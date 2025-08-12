
import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig } from '../config';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';

interface KeyInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
  link: string;
  linkText: string;
  isPassword?: boolean;
}

const KeyInput = ({ name, label, value, onChange, description, link, linkText, isPassword = false }: KeyInputProps) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={isPassword && !isRevealed ? 'password' : 'text'}
                    value={value}
                    onChange={onChange}
                    placeholder={`Enter your ${label}`}
                    className="w-full p-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                />
                {isPassword && value && (
                    <button
                        type="button"
                        onClick={() => setIsRevealed(!isRevealed)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label={isRevealed ? "Hide key" : "Show key"}
                    >
                        {isRevealed ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                {linkText} &rarr;
            </a>
        </div>
    );
};

export const SettingsView = () => {
  const [config, setConfig] = useState(getConfig);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(config);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <div className="p-4 sm:p-6 flex-grow">
      <div className="w-full max-w-md mx-auto my-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl text-center">Settings</h1>
        <p className="mt-2 text-purple-600 dark:text-purple-300 text-center">Configure the API keys for the application.</p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            Your keys are saved securely in your browser's local storage and are never sent anywhere else.
        </p>
      </div>

      <form onSubmit={handleSave} className="w-full max-w-md mx-auto space-y-6">
        <KeyInput
          name="apiKey"
          label="Google AI API Key"
          value={config.apiKey}
          onChange={handleChange}
          isPassword
          description="Required for generating images and videos. Get it from Google AI Studio."
          link="https://aistudio.google.com/app/apikey"
          linkText="Get Google AI Key"
        />

        <KeyInput
          name="googleClientId"
          label="Google Sign-In Client ID"
          value={config.googleClientId}
          onChange={handleChange}
          description="Optional. Enables Google Sign-In feature."
          link="https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid"
          linkText="Get Google Client ID"
        />

        <KeyInput
          name="googleAdsenseClientId"
          label="Google AdSense Client ID"
          value={config.googleAdsenseClientId}
          onChange={handleChange}
          description="Optional. Your AdSense publisher ID (e.g., pub-xxxxxxxxxxxxxxxx)."
          link="https://support.google.com/adsense/answer/105516?hl=en"
          linkText="Find AdSense Client ID"
        />

        <KeyInput
          name="googleAdsenseInterstitialAdUnitId"
          label="Google AdSense Interstitial Ad Unit ID"
          value={config.googleAdsenseInterstitialAdUnitId}
          onChange={handleChange}
          description="Optional. The ID for your interstitial ad unit."
          link="https://support.google.com/adsense/answer/9262311?hl=en"
          linkText="Create an Ad Unit"
        />

        <div className="pt-4 flex items-center justify-end">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mr-4 transition-opacity duration-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          )}
          <button
            type="submit"
            className="px-6 py-3 font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors duration-300 transform active:scale-95"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
