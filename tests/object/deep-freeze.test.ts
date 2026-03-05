import { describe, expect, it } from 'bun:test';
import { objectDeepFreeze } from '../../src/object/index.js';

describe('deepFreeze', () => {
	it('should freeze a simple object', () => {
		const object = {
			a: 1,
			b: {
				c: 2,
			},
			d: [3, 4, 5],
		};

		const frozenObject = objectDeepFreeze(object);

		// Check if the object itself is frozen
		expect(Object.isFrozen(frozenObject)).toBe(true);

		// Check if nested objects and arrays are frozen
		expect(Object.isFrozen(frozenObject.b)).toBe(true);
		expect(Object.isFrozen(frozenObject.d)).toBe(true);
	});

	it('should throw error when mutating frozen object', () => {
		const object = {
			a: 1,
			b: {
				c: 2,
			},
		};

		const frozenObject = objectDeepFreeze(object);

		// Attempt to mutate frozenObj
		expect(() => {
			(frozenObject as any).a = 10;
		}).toThrow();

		// Attempt to mutate nested property
		expect(() => {
			(frozenObject as any).b.c = 20;
		}).toThrow();
	});

	it('should handle arrays and nested arrays', () => {
		const object = {
			a: [1, 2, 3],
			b: [{ c: 4 }, [5, 6, 7]],
		};

		const frozenObject = objectDeepFreeze(object);

		// Check if arrays and nested arrays are frozen
		expect(Object.isFrozen(frozenObject.a)).toBe(true);
		expect(Object.isFrozen(frozenObject.b)).toBe(true);
		expect(Object.isFrozen(frozenObject.b[0])).toBe(true);
		expect(Object.isFrozen(frozenObject.b[1])).toBe(true);
	});

	it('should handle arrays', () => {
		const object = [{ key: 4 }, { key: 1 }, { key: 2 }];
		// @ts-expect-error - Testing handling of array input
		const frozenObject = objectDeepFreeze(object);
		// @ts-expect-error - Testing handling of array input
		expect(Object.isFrozen(frozenObject.at(0))).toBe(true);
	});
});
