
import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { isGoogleAdSenseAvailable, GOOGLE_ADSENSE_INTERSTITIAL_AD_UNIT_ID } from '../config';

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
    const [adState, setAdState] = useState<AdState>('idle');
    
    // This effect handles the ad state transitions and cleanup.
    const handleAdClosed = useCallback(() => {
        setAdState('idle');
        if (onAdClosedCallbackRef.current) {
            onAdClosedCallbackRef.current();
            onAdClosedCallbackRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isGoogleAdSenseAvailable) {
            console.warn("Google AdSense is not configured.");
            return;
        }

        window.googletag = window.googletag || { cmd: [] };

        window.googletag.cmd.push(() => {
            const slot = window.googletag.defineOutOfPageSlot(
                GOOGLE_ADSENSE_INTERSTITIAL_AD_UNIT_ID,
                window.googletag.enums.OutOfPageFormat.INTERSTITIAL
            );

            if (slot) {
                interstitialSlotRef.current = slot;
                slot.addService(window.googletag.pubads());
                console.log("Interstitial ad slot defined.");

                window.googletag.pubads().addEventListener('slotRenderEnded', (event: any) => {
                    if (event.slot === interstitialSlotRef.current) {
                        // If the slot is empty, it means no ad was served.
                        // We should close the "loading" state and fire the callback.
                        if (event.isEmpty) {
                            console.log('Ad slot was empty. No ad to show.');
                            // We use setAdState with a function to get the latest state
                            // to avoid issues with stale state in the event listener closure.
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

            } else {
                console.error("Failed to define interstitial ad slot.");
            }
            
            window.googletag.pubads().enableSingleRequest();
            window.googletag.enableServices();
        });

    }, [handleAdClosed]);

    const showInterstitialAd = useCallback((onAdClosed?: () => void) => {
        if (!isGoogleAdSenseAvailable || !interstitialSlotRef.current) {
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
    }, [handleAdClosed]);

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
