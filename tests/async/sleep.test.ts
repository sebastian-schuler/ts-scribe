import { describe, expect, it } from 'bun:test';
import { sleep } from '../../src/async/index.js';

describe('sleep', () => {
	it('sleep waits the specified amount of time', async () => {
		const startTime = Date.now();
		const sleepTime = 1000 * 3;
		await sleep(sleepTime);

		const endTime = Date.now();
		expect(endTime - startTime >= sleepTime).toBe(true);
	});
});
