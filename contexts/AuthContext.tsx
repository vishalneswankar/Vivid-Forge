import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { decodeJwt } from '../services/jwt';
import { GOOGLE_CLIENT_ID, isGoogleAuthAvailable } from '../config';

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
            // Clear any potentially corrupted state
            setUser(null);
            localStorage.removeItem('user-profile');
        }
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user-profile');
        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
            // Optional: You can revoke the token on sign-out for higher security,
            // but this requires the user to re-consent on next login.
            // google.accounts.id.revoke(user.email, () => {});
        }
        console.log("User signed out");
    }, []);

    const signIn = useCallback(() => {
        if (!isGoogleAuthAvailable || !isInitialized) {
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
    }, [isInitialized]);

    useEffect(() => {
        // Attempt to load user from localStorage on initial load
        const storedUser = localStorage.getItem('user-profile');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user-profile');
            }
        }

        const checkGoogleAndInit = () => {
             if (window.google && window.google.accounts) {
                if (!isGoogleAuthAvailable) {
                    console.warn("Google Sign-In is not configured. Please provide the GOOGLE_CLIENT_ID environment variable.");
                    setIsInitialized(true);
                    return;
                }
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: true,
                });
                setIsInitialized(true);
            } else {
                // If google script isn't loaded yet, try again shortly.
                setTimeout(checkGoogleAndInit, 100);
            }
        }
        
       checkGoogleAndInit();
       
    }, [handleCredentialResponse]);


    const value = { user, isInitialized, signOut, signIn, isAuthAvailable: isGoogleAuthAvailable };

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