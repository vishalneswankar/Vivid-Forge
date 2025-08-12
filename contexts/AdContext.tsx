
import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { isGoogleAdSenseAvailable, getConfig } from '../config';

// Augment the window object for googletag
declare global {
  interface Window {
    googletag: any;
  }
}

// Define the shape of the ad state
type AdState = 'idle' | 'loading' | 'visible';

interface AdContextType {
  showInterstitialAd: (onAdClosed?: () => void) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// A simple overlay component to show while the ad is loading/visible.
const AdOverlay = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" aria-live="polite">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-white mb-4"></div>
                <p className="text-white text-lg font-semibold">Loading Advertisement...</p>
            </div>
        </div>
    );
};


export const AdProvider = ({ children }: { children: React.ReactNode }) => {
    const interstitialSlotRef = useRef<any>(null);
    const onAdClosedCallbackRef = useRef<(() => void) | null>(null);
    const listenersAttached = useRef(false);
    const [adState, setAdState] = useState<AdState>('idle');
    const [isAdConfigured, setIsAdConfigured] = useState(isGoogleAdSenseAvailable());
    
    const handleAdClosed = useCallback(() => {
        setAdState('idle');
        if (onAdClosedCallbackRef.current) {
            onAdClosedCallbackRef.current();
            onAdClosedCallbackRef.current = null;
        }
    }, []);

    const initAds = useCallback(() => {
        const available = isGoogleAdSenseAvailable();
        setIsAdConfigured(available);
        
        if (!available) {
            console.warn("Google AdSense is not configured.");
            if(window.googletag && window.googletag.destroySlots) {
                window.googletag.destroySlots();
            }
            return;
        }

        const { googleAdsenseInterstitialAdUnitId } = getConfig();
        window.googletag = window.googletag || { cmd: [] };

        window.googletag.cmd.push(() => {
            if(window.googletag.destroySlots) {
                window.googletag.destroySlots();
            }
            const slot = window.googletag.defineOutOfPageSlot(
                googleAdsenseInterstitialAdUnitId,
                window.googletag.enums.OutOfPageFormat.INTERSTITIAL
            );

            if (slot) {
                interstitialSlotRef.current = slot;
                slot.addService(window.googletag.pubads());
                console.log("Interstitial ad slot defined/re-defined.");

                if (!listenersAttached.current) {
                    window.googletag.pubads().addEventListener('slotRenderEnded', (event: any) => {
                        if (event.slot === interstitialSlotRef.current) {
                            if (event.isEmpty) {
                                console.log('Ad slot was empty. No ad to show.');
                                setAdState(currentState => {
                                    if (currentState === 'loading') {
                                        handleAdClosed();
                                        return 'idle'; 
                                    }
                                    return currentState;
                                });
                            } else {
                               console.log('Ad slot rendered, ad should be visible.');
                               setAdState('visible');
                            }
                        }
                    });

                    window.googletag.pubads().addEventListener('slotClosed', (event: any) => {
                        if (event.slot === interstitialSlotRef.current) {
                            console.log('Interstitial ad slot closed by user.');
                            handleAdClosed();
                        }
                    });
                    listenersAttached.current = true;
                }

            } else {
                console.error("Failed to define interstitial ad slot.");
            }
            
            window.googletag.pubads().enableSingleRequest();
            window.googletag.enableServices();
        });

    }, [handleAdClosed]);

    useEffect(() => {
        initAds();
        window.addEventListener('config-updated', initAds);
        return () => window.removeEventListener('config-updated', initAds);
    }, [initAds]);

    const showInterstitialAd = useCallback((onAdClosed?: () => void) => {
        if (!isAdConfigured || !interstitialSlotRef.current) {
            console.log("Ad request skipped: AdSense not available or slot not defined.");
            onAdClosed?.(); // If ads are not available, just run the callback.
            return;
        }
        
        console.log("Requesting interstitial ad display...");
        setAdState('loading');
        if (onAdClosed) {
            onAdClosedCallbackRef.current = onAdClosed;
        }

        window.googletag.cmd.push(() => {
            try {
                window.googletag.display(interstitialSlotRef.current);
            } catch (error) {
                console.error("Error displaying interstitial ad:", error);
                handleAdClosed();
            }
        });
    }, [isAdConfigured, handleAdClosed]);

    const value = { showInterstitialAd };

    return (
        <AdContext.Provider value={value}>
            {children}
            <AdOverlay show={adState === 'loading'} />
        </AdContext.Provider>
    );
};

export const useAd = () => {
    const context = useContext(AdContext);
    if (context === undefined) {
        throw new Error('useAd must be used within an AdProvider');
    }
    return context;
};
