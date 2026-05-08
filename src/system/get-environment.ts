import process from 'node:process';

/**
 * Detects the current runtime environment.
 *
 * @category System
 * @returns {string} A string indicating the environment. Possible values: 'Browser', 'Node', 'Bun', 'Unknown'.
 *
 * @example
 * if (getEnvironment() === 'Node') {
 *   console.log('Running in Node.js');
 * } else if (getEnvironment() === 'Bun') {
 *   console.log('Running in Bun');
 * } else if (getEnvironment() === 'Browser') {
 *   console.log('Running in a browser');
 * }
 */
export function getEnvironment(): 'Browser' | 'Node' | 'Bun' | 'Unknown' {
	// Check if in a browser environment
	if (globalThis.window !== undefined && globalThis.document !== undefined) {
		return 'Browser';
	}

	// Check if in a Bun environment
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-type-assertion, unicorn/no-typeof-undefined
	if (typeof (globalThis as any).Bun !== 'undefined' && (globalThis as any).Bun?.version !== undefined) {
		return 'Bun';
	}

	// Check if in a Node.js environment
	if (process !== undefined && Boolean(process.versions) && Boolean(process.versions.node)) {
		return 'Node';
	}

	// If we can't identify, return unknown
	return 'Unknown';
}
