import { describe, expect, it } from 'bun:test';
import { objectDeepEquals } from '../../src/object/index.js';

describe('deepEquals', () => {
	it('should return true for equal primitive values', () => {
		expect(objectDeepEquals(5, 5)).toBe(true);
		expect(objectDeepEquals('hello', 'hello')).toBe(true);
		expect(objectDeepEquals(true, true)).toBe(true);
		// @ts-expect-error - null and undefined are different types, but we want to test their equality
		expect(objectDeepEquals(null, null)).toBe(true);
	});

	it('should return false for different primitive values', () => {
		expect(objectDeepEquals(5, 10)).toBe(false);
		expect(objectDeepEquals('hello', 'world')).toBe(false);
		expect(objectDeepEquals(true, false)).toBe(false);
		// @ts-expect-error - null and undefined are different types, but we want to test their equality
		expect(objectDeepEquals(null, undefined)).toBe(false);
	});

	it('should return true for equal nested objects', () => {
		const object1 = {
			a: 1,
			b: {
				c: 2,
				d: [3, 4],
			},
		};

		const object2 = {
			a: 1,
			b: {
				c: 2,
				d: [3, 4],
			},
		};

		expect(objectDeepEquals(object1, object2)).toBe(true);
	});

	it('should return false for different nested objects', () => {
		const object1 = {
			a: 1,
			b: {
				c: 2,
				d: [3, 4],
			},
		};

		const object2 = {
			a: 1,
			b: {
				c: 2,
				d: [5, 6], // Different array values
			},
		};

		expect(objectDeepEquals(object1, object2)).toBe(false);
	});

	it('should handle arrays correctly', () => {
		const array1 = [1, [2, 3], { a: 4 }];
		const array2 = [1, [2, 3], { a: 4 }];
		const array3 = [1, [2, 3], { a: 5 }]; // Different object value

		expect(objectDeepEquals(array1, array2)).toBe(true);
		expect(objectDeepEquals(array1, array3)).toBe(false);
	});

	it('should return false for objects with different number of keys', () => {
		const object1 = { a: 1, b: 2 };
		const object2 = { a: 1 };

		expect(objectDeepEquals(object1, object2)).toBe(false);
	});

	it('should return true for objects with same keys but different order', () => {
		const object1 = { a: 1, b: 2 };
		const object2 = { b: 2, a: 1 };

		expect(objectDeepEquals(object1, object2)).toBe(true);
	});

	it('should handle circular references', () => {
		const object1: any = {};
		object1.a = object1;

		const object2: any = {};
		object2.a = object2;

		expect(objectDeepEquals(object1, object2)).toBe(true);
	});

	it('should return true for empty objects', () => {
		expect(objectDeepEquals({}, {})).toBe(true);
	});

	it('should return true for empty arrays', () => {
		expect(objectDeepEquals([], [])).toBe(true);
	});

	it('should return false when comparing empty object with empty array', () => {
		expect(objectDeepEquals({}, [])).toBe(false);
		expect(objectDeepEquals([], {})).toBe(false);
	});

	it('should return false when comparing object with array', () => {
		expect(objectDeepEquals({ a: 1 }, [1])).toBe(false);
	});

	it('should return false when comparing array with primitive', () => {
		expect(objectDeepEquals([1, 2, 3], 123)).toBe(false);
	});

	it('should return false when comparing object with primitive', () => {
		expect(objectDeepEquals({ a: 1 }, 1)).toBe(false);
	});

	it('should return false for arrays with different lengths', () => {
		expect(objectDeepEquals([1, 2, 3], [1, 2])).toBe(false);
		expect(objectDeepEquals([1], [1, 2, 3])).toBe(false);
	});

	it('should handle special number values', () => {
		expect(objectDeepEquals(NaN, NaN)).toBe(false); // NaN !== NaN in JavaScript
		expect(objectDeepEquals(Infinity, Infinity)).toBe(true);
		expect(objectDeepEquals(-Infinity, -Infinity)).toBe(true);
		expect(objectDeepEquals(Infinity, -Infinity)).toBe(false);
	});

	it('should return false for Date objects', () => {
		const date1 = new Date('2024-01-01');
		const date2 = new Date('2024-01-01');
		// @ts-expect-error - Date objects are not Nestable types
		expect(objectDeepEquals(date1, date2)).toBe(false); // Different instances
	});

	it('should return false for RegExp objects', () => {
		const regex1 = /test/;
		const regex2 = /test/;
		// @ts-expect-error - RegExp objects are not Nestable types
		expect(objectDeepEquals(regex1, regex2)).toBe(false);
	});

	it('should handle objects with undefined values', () => {
		const object1 = { a: 1, b: undefined };
		const object2 = { a: 1, b: undefined };
		const object3 = { a: 1 };

		expect(objectDeepEquals(object1, object2)).toBe(true);
		expect(objectDeepEquals(object1, object3)).toBe(false); // b: undefined vs no b key
	});

	it('should handle nested circular references', () => {
		const object1: any = { nested: {} };
		object1.nested.ref = object1;

		const object2: any = { nested: {} };
		object2.nested.ref = object2;

		expect(objectDeepEquals(object1, object2)).toBe(true);
	});

	it('should handle arrays with circular references', () => {
		const array1: any = [1, 2];
		array1.push(array1);

		const array2: any = [1, 2];
		array2.push(array2);

		expect(objectDeepEquals(array1, array2)).toBe(true);
	});

	it('should return false for mismatched circular references in arrays', () => {
		const array1: any = [1, 2];
		array1.push(array1);

		const array2 = [1, 2, []];

		expect(objectDeepEquals(array1, array2)).toBe(false);
	});

	it('should handle nested arrays with circular references', () => {
		const array1: any = [1, [2, 3]];
		array1[1].push(array1);

		const array2: any = [1, [2, 3]];
		array2[1].push(array2);

		expect(objectDeepEquals(array1, array2)).toBe(true);
	});

	it('should return false for mismatched circular references', () => {
		const object1: any = {};
		object1.a = object1;

		const object2 = { a: {} };

		expect(objectDeepEquals(object1, object2)).toBe(false);
	});

	it('should handle deeply nested objects', () => {
		const object1 = { a: { b: { c: { d: { e: 5 } } } } };
		const object2 = { a: { b: { c: { d: { e: 5 } } } } };
		const object3 = { a: { b: { c: { d: { e: 6 } } } } };

		expect(objectDeepEquals(object1, object2)).toBe(true);
		expect(objectDeepEquals(object1, object3)).toBe(false);
	});

	it('should handle arrays with nested objects', () => {
		const array1 = [{ a: 1 }, { b: [2, 3] }];
		const array2 = [{ a: 1 }, { b: [2, 3] }];
		const array3 = [{ a: 1 }, { b: [2, 4] }];

		expect(objectDeepEquals(array1, array2)).toBe(true);
		expect(objectDeepEquals(array1, array3)).toBe(false);
	});
});
