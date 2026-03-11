import { describe, expect, it } from 'bun:test';
import { objectPickKeys } from '../../src/object/index.js';

describe('objectPickKeys', () => {
	it('should pick a single key from the object', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectPickKeys(object, ['a']);

		expect(result).toEqual({ a: 1 });
	});

	it('should pick multiple keys from the object', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 };
		const result = objectPickKeys(object, ['a', 'c']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should return an empty object if no keys are specified', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectPickKeys(object, []);

		expect(result).toEqual({});
	});

	it('should not mutate the original object', () => {
		const object = { a: 1, b: 2, c: 3 };
		const originalObject = { ...object };

		objectPickKeys(object, ['a', 'b']);

		// Check that the original object is unchanged
		expect(object).toEqual(originalObject);
	});

	it('should handle empty objects gracefully', () => {
		const object = {};

		// @ts-expect-error testing edge case
		const result = objectPickKeys(object, ['a']);

		expect(result).toEqual({});
	});

	it('should return an empty object if the key to pick does not exist', () => {
		const object = { a: 1, b: 2 };

		// @ts-expect-error testing edge case
		const result = objectPickKeys(object, ['c']); // 'c' doesn't exist in the object

        // @ts-expect-error testing edge case
		expect(result).toEqual({});
	});

	it('should pick only existing keys from mixed valid and invalid keys', () => {
		const object = { a: 1, b: 2, c: 3 };

		// @ts-expect-error testing edge case with mixed keys
		const result = objectPickKeys(object, ['a', 'd', 'c']);

        // @ts-expect-error testing edge case with mixed keys
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
			obj: { nested: true }
		};
		const result = objectPickKeys(object, ['str', 'num', 'arr']);

		expect(result).toEqual({ str: 'text', num: 42, arr: [1, 2, 3] });
	});

	it('should not alter the type of the object when picking keys', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 };
		const result = objectPickKeys(object, ['a', 'c']);

		// TypeScript should ensure result has only 'a' and 'c'
		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should handle objects with symbol keys', () => {
		const sym1 = Symbol('key1');
		const sym2 = Symbol('key2');
		const object = { [sym1]: 'value1', [sym2]: 'value2', regular: 'test' };
		
		const result = objectPickKeys(object, [sym1, 'regular'] as const);

		expect(result).toEqual({ [sym1]: 'value1', regular: 'test' });
	});

	it('should preserve undefined values in picked keys', () => {
		const object = { a: 1, b: undefined, c: 3 };
		const result = objectPickKeys(object, ['a', 'b']);

		expect(result).toEqual({ a: 1, b: undefined });
		expect('b' in result).toBe(true);
	});

	it('should handle duplicate keys in the keys array', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectPickKeys(object, ['a', 'a', 'b']);

		expect(result).toEqual({ a: 1, b: 2 });
	});

	it('should only pick own and inherited properties', () => {
		const proto = { inherited: 'proto value' };
		const object = Object.create(proto);
		object.own = 'own value';

		const result = objectPickKeys(object, ['own', 'inherited']);

		// Should pick both own and inherited properties due to 'in' operator
		expect(result).toEqual({ own: 'own value', inherited: 'proto value' });
	});

	it('should handle non-enumerable properties', () => {
		const object = { a: 1, b: 2 };
		Object.defineProperty(object, 'hidden', {
			value: 'secret',
			enumerable: false,
		});

		// @ts-expect-error testing edge case
		const result = objectPickKeys(object, ['a', 'hidden']);

		// Should pick non-enumerable properties
        // @ts-expect-error testing edge case with non-enumerable properties
		expect(result).toEqual({ a: 1, hidden: 'secret' });
	});

	it('should handle objects with null prototype', () => {
		const object = Object.create(null);
		object.a = 1;
		object.b = 2;
		object.c = 3;

		const result = objectPickKeys(object, ['a', 'c']);

		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should work with arrays', () => {
		const array = ['a', 'b', 'c'];
		const result = objectPickKeys(array, [0, 2] as const);

		expect(result).toEqual({ 0: 'a', 2: 'c' });
	});

	it('should handle objects with getters', () => {
		let callCount = 0;
		const object = {
			a: 1,
			get b() {
				callCount++;
				return 2;
			},
			c: 3,
		};

		const result = objectPickKeys(object, ['a', 'b']);

		expect(result).toEqual({ a: 1, b: 2 });
		expect(callCount).toBe(1); // Getter should be called once during pick
	});

	it('should create a new object reference', () => {
		const object = { a: 1, b: 2, c: 3 };
		const result = objectPickKeys(object, ['a', 'b', 'c']);

		expect(result).toEqual(object);
		expect(result).not.toBe(object); // Should be a different reference
	});
});
