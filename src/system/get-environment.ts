/**
 * Detects the current runtime environment.
 *
 * @returns {string} A string indicating the environment. Possible values: 'Browser', 'Node', 'Bun', 'Unknown'.
 */
export function getEnvironment(): 'Browser' | 'Node' | 'Bun' | 'Unknown' {
  // Check if in a browser environment
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    return 'Browser';
  }

  // Check if in a Bun environment
  if (typeof Bun !== 'undefined' && typeof Bun.version !== 'undefined') {
    return 'Bun';
  }

  // Check if in a Node.js environment
  if (typeof process !== 'undefined' && !!process.versions && !!process.versions.node) {
    return 'Node';
  }

  // If we can't identify, return unknown
  return 'Unknown';
}
