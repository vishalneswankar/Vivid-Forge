/**
 * Decodes a JWT token without verifying the signature. 
 * This is safe to use for the payload from Google Sign-In on the client-side,
 * as it's used for non-sensitive profile information.
 * @param token The JWT token string.
 * @returns The decoded payload object.
 */
export const decodeJwt = (token: string): unknown => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            throw new Error('Invalid JWT token: Missing payload.');
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
};