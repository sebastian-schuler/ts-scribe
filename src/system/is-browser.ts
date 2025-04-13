/**
 * Determines whether the current environment is a browser.
 *
 * Checks for the existence of `window` and `document` objects to infer a browser context.
 *
 * @returns {boolean} `true` if running in a browser environment, otherwise `false`.
 *
 * @example
 * isBrowser(); // true in browser, false in Node.js or other non-browser environments
 */
export const isBrowser = (): boolean => typeof window === 'object' && typeof document === 'object';
