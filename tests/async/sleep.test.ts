import { describe, expect, it } from 'bun:test';
import { sleep } from '../../src/async/index.js';

describe('sleep', () => {
	it('sleep waits the specified amount of time', async () => {
		const startTime = performance.now();
		const sleepTime = 50;
		await sleep(sleepTime);

		const endTime = performance.now();
		expect(endTime - startTime).toBeGreaterThanOrEqual(sleepTime);
	});

	it('sleep resolves for a zero delay', async () => {
		const startTime = performance.now();
		await sleep(0);
		const endTime = performance.now();

		expect(endTime - startTime).toBeGreaterThanOrEqual(0);
	});

	it('sleep resolves for a negative delay', async () => {
		const startTime = performance.now();
		await sleep(-1);
		const endTime = performance.now();

		expect(endTime - startTime).toBeGreaterThanOrEqual(0);
	});
});
