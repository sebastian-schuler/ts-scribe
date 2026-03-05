import { describe, expect, it } from 'bun:test';
import { isNode } from '../../src/system/index.js';

describe('isNode', () => {
	it('should return true if running in a Node.js environment', () => {
		// Simulate Node.js environment
		const originalProcess = globalThis.process;
		// @ts-expect-error simulate node env
		globalThis.process = { versions: { node: '14.0.0' } };

		expect(isNode()).toBe(true);

		// Restore original process object
		globalThis.process = originalProcess;
	});

	it('should return false if process is undefined', () => {
		// Simulate non-Node.js environment
		const originalProcess = globalThis.process;
		// @ts-expect-error simulate node env
		delete globalThis.process;

		expect(isNode()).toBe(false);

		// Restore original process object
		globalThis.process = originalProcess;
	});

	it('should return false if process.versions is undefined', () => {
		// Simulate non-Node.js environment
		const originalProcess = globalThis.process;
		// @ts-expect-error simulate node env
		globalThis.process = {};

		expect(isNode()).toBe(false);

		// Restore original process object
		globalThis.process = originalProcess;
	});

	it('should return false if process.versions.node is undefined', () => {
		// Simulate non-Node.js environment
		const originalProcess = globalThis.process;
		// @ts-expect-error simulate node env
		globalThis.process = { versions: {} };

		expect(isNode()).toBe(false);

		// Restore original process object
		globalThis.process = originalProcess;
	});
});
