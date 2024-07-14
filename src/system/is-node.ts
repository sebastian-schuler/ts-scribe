/**
 * Check if the code is running in Node.js
 * @returns true if node; false if not
 */
export const isNode = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
