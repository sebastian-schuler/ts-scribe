import { describe, expect, it } from 'bun:test';
import { removeObjectKeys } from '../../src/object/index.js';

describe('removeKeys', () => {
	it('should remove a single key from the object', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = removeObjectKeys(object, ['b']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should remove multiple keys from the object', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 };
		const result = removeObjectKeys(object, ['b', 'd']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should return the original object if no keys are specified', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = removeObjectKeys(object, []);

		expect(result).toEqual(object); // Should return the same object
	});

	it('should not mutate the original object', () => {
		const object = { a: 1, b: 2, c: 3 };
		const originalObject = { ...object };

		removeObjectKeys(object, ['b']);

		// Check that the original object is unchanged
		expect(object).toEqual(originalObject);
	});

	it('should handle empty objects gracefully', () => {
		const object = {};

		// Should throw a TypeError if the function tries to access a property of an empty object
		// @ts-expect-error testing expects an error
		const result = removeObjectKeys(object, ['a']);

		expect(result).toEqual({}); // Should return an empty object
	});

	it('should return the same object if the key to remove does not exist', () => {
		const object = { a: 1, b: 2 };

		// Should throw a TypeError if the function tries to access a property of an empty object
		// @ts-expect-error testing expects an error
		const result = removeObjectKeys(object, ['c']); // 'c' doesn't exist in the object

		expect(result).toEqual(object); // Should return the same object
	});

	it('should not alter the type of the object when removing keys', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 };
		const result = removeObjectKeys(object, ['b', 'd']);

		// TypeScript should ensure result has only 'a' and 'c'
		expect(result).toEqual({ a: 1, c: 3 });
	});
});
