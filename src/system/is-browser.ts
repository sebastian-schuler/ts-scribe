/**
 * Check if the code is running in the browser
 * @returns true if in a browser; false if not
 */
export const isBrowser = () => typeof window === 'object' && typeof document === 'object';
