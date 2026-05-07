import { describe, expect, it } from 'bun:test';
import { getEnvironment } from '../../src/system/index.js';

describe('getEnvironment', () => {
	it('should detect Bun environment when running in Bun', () => {
		expect(getEnvironment()).toBe('Bun');
	});
});
