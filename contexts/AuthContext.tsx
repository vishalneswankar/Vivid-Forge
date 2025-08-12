
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { decodeJwt } from '../services/jwt';
import { isGoogleAuthAvailable, getConfig } from '../config';

declare global {
    interface Window {
        google: any;
    }
}

interface AuthContextType {
  user: User | null;
  isInitialized: boolean;
  signOut: () => void;
  signIn: () => void;
  isAuthAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthAvailable, setIsAuthAvailable] = useState(isGoogleAuthAvailable());

    const handleCredentialResponse = useCallback((response: any) => {
        try {
            const idToken = response.credential;
            const decodedToken: any = decodeJwt(idToken);

            const newUser: User = {
                id: decodedToken.sub,
                name: decodedToken.name,
                email: decodedToken.email,
                picture: decodedToken.picture,
            };
            
            setUser(newUser);
            localStorage.setItem('user-profile', JSON.stringify(newUser));

        } catch (error) {
            console.error("Error decoding JWT or setting user:", error);
            setUser(null);
            localStorage.removeItem('user-profile');
        }
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user-profile');
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
        console.log("User signed out");
    }, []);
    
    const init = useCallback(() => {
        setIsInitialized(false);
        const initGoogleSignIn = () => {
             if (window.google && window.google.accounts) {
                const available = isGoogleAuthAvailable();
                setIsAuthAvailable(available);

                if (!available) {
                    console.warn("Google Sign-In is not configured.");
                    setIsInitialized(true);
                    return;
                }
                const { googleClientId } = getConfig();
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleCredentialResponse,
                    auto_select: true,
                });
                setIsInitialized(true);
                console.log('Google Sign-In initialized/re-initialized.');
            } else {
                setTimeout(initGoogleSignIn, 100);
            }
        }
       initGoogleSignIn();
    }, [handleCredentialResponse]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user-profile');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user-profile');
            }
        }
        
        init();

        window.addEventListener('config-updated', init);

        return () => {
            window.removeEventListener('config-updated', init);
        };
       
    }, [init]);


    const signIn = useCallback(() => {
        if (!isAuthAvailable || !isInitialized) {
            console.warn("Sign-in function called before initialization or auth is unavailable.");
            return;
        }

        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    console.warn(`Sign-in prompt was not displayed. Reason: ${notification.getNotDisplayedReason()}`);
                } else if (notification.isSkippedMoment()) {
                    console.log(`Sign-in prompt was skipped. Reason: ${notification.getSkippedReason()}`);
                }
            });
        } else {
            console.error("Google accounts script not available to trigger sign-in prompt.");
        }
    }, [isInitialized, isAuthAvailable]);

    const value = { user, isInitialized, signOut, signIn, isAuthAvailable };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
