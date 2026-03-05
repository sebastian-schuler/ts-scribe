import { describe, expect, it } from 'bun:test';
import { run } from '../../src/core/index.js';

describe('run', () => {
	it('returns the callback result', () => {
		const result = run(() => 42);

		expect(result).toBe(42);
	});

	it('executes the callback body', () => {
		let count = 0;
		run(() => {
			count += 1;
		});

		expect(count).toBe(1);
	});

	it('rethrows errors from the callback', () => {
		expect(() => {
			run(() => {
				throw new Error('boom');
			});
		}).toThrow('boom');
	});
});
