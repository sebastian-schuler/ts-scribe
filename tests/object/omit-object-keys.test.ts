import { describe, expect, it } from 'bun:test';
import { objectOmitKeys } from '../../src/object/index.js';

describe('objectOmitKeys', () => {
	it('should omit a single key from the object', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectOmitKeys(object, ['b']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should omit multiple keys from the object', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 };
		const result = objectOmitKeys(object, ['b', 'd']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should return a copy of the original object if no keys are specified', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectOmitKeys(object, []);

		expect(result).toEqual(object);
		expect(result).not.toBe(object); // Should be a different reference
	});

	it('should not mutate the original object', () => {
		const object = { a: 1, b: 2, c: 3 };
		const originalObject = { ...object };

		objectOmitKeys(object, ['b']);

		// Check that the original object is unchanged
		expect(object).toEqual(originalObject);
	});

	it('should handle empty objects gracefully', () => {
		const object = {};

		// @ts-expect-error testing edge case
		const result = objectOmitKeys(object, ['a']);

		expect(result).toEqual({});
	});

	it('should return the same object if the key to omit does not exist', () => {
		const object = { a: 1, b: 2 };

		// @ts-expect-error testing edge case
		const result = objectOmitKeys(object, ['c']); // 'c' doesn't exist in the object

		expect(result).toEqual(object);
	});

	it('should omit only existing keys from mixed valid and invalid keys', () => {
		const object = { a: 1, b: 2, c: 3 };

		// @ts-expect-error testing edge case with mixed keys
		const result = objectOmitKeys(object, ['b', 'd']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should handle objects with various value types', () => {
		const object = {
			str: 'text',
			num: 42,
			bool: true,
			nil: null,
			undef: undefined,
			arr: [1, 2, 3],
			obj: { nested: true },
		};
		const result = objectOmitKeys(object, ['num', 'bool', 'obj']);

		expect(result).toEqual({
			str: 'text',
			nil: null,
			undef: undefined,
			arr: [1, 2, 3],
		});
	});

	it('should not alter the type of the object when omitting keys', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 };
		const result = objectOmitKeys(object, ['b', 'd']);

		// TypeScript should ensure result has only 'a' and 'c'
		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should handle objects with symbol keys', () => {
		const sym1 = Symbol('key1');
		const sym2 = Symbol('key2');
		const object = { [sym1]: 'value1', [sym2]: 'value2', regular: 'test' };

		const result = objectOmitKeys(object, [sym2] as const);

		expect(result).toEqual({ [sym1]: 'value1', regular: 'test' });
	});

	it('should preserve undefined values in remaining keys', () => {
		const object = { a: 1, b: undefined, c: 3 };
		const result = objectOmitKeys(object, ['c']);

		expect(result).toEqual({ a: 1, b: undefined });
		expect('b' in result).toBe(true);
	});

	it('should create a shallow copy of the object', () => {
		const nested = { x: 1 };
		const object = { a: nested, b: 2 };
		const result = objectOmitKeys(object, ['b']);

		expect(result).toEqual({ a: nested });
		expect(result.a).toBe(nested); // Should reference the same nested object
	});

	it('should handle duplicate keys in the keys array', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectOmitKeys(object, ['b', 'b', 'c']);

		expect(result).toEqual({ a: 1 });
	});

	it('should not copy inherited properties to the result', () => {
		const proto = { inherited: 'proto value' };
		const object = Object.create(proto);
		object.own = 'own value';
		object.other = 'other value';

		const result = objectOmitKeys(object, ['other']);

		// Spread operator only copies own enumerable properties, not inherited
		expect(result).toEqual({ own: 'own value' });
		expect('inherited' in result).toBe(false); // Inherited property not copied
	});

	it('should not copy non-enumerable properties', () => {
		const object = { a: 1, b: 2, c: 3 };
		Object.defineProperty(object, 'hidden', {
			value: 'secret',
			enumerable: false,
		});

		const result = objectOmitKeys(object, ['b']);

		// Spread operator doesn't copy non-enumerable properties
		expect(result).toEqual({ a: 1, c: 3 });
		expect('hidden' in result).toBe(false);
	});

	it('should handle objects with null prototype', () => {
		const object = Object.create(null);
		object.a = 1;
		object.b = 2;
		object.c = 3;

		const result = objectOmitKeys(object, ['b']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should work with arrays', () => {
		const array = ['a', 'b', 'c'];
		const result = objectOmitKeys(array, [1] as const);

        // @ts-expect-error testing edge case with arrays
		expect(result).toEqual({ 0: 'a', 2: 'c' });
		expect(Array.isArray(result)).toBe(false); // Result is a plain object, not array
	});

	it('should handle objects with getters', () => {
		let getterCallCount = 0;
		const object = {
			a: 1,
			get b() {
				getterCallCount++;
				return 2;
			},
			c: 3,
		};

		const result = objectOmitKeys(object, ['c']);

		// Spread operator will call the getter
		expect(result).toEqual({ a: 1, b: 2 });
		expect(getterCallCount).toBe(1); // Getter should be called during spread
	});

	it('should handle objects with setters', () => {
		let value = 0;
		const object = {
			a: 1,
			set b(val: number) {
				value = val;
			},
			get b() {
				return value;
			},
			c: 3,
		};

		object.b = 2;
		const result = objectOmitKeys(object, ['c']);

		expect(result).toEqual({ a: 1, b: 2 });
	});
});
