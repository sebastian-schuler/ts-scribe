import { describe, expect, it } from 'bun:test';
import { flattenObject } from '../../src/object/index.js';

describe('flattenObject', () => {
	it('should flatten a simple nested object', () => {
		const input = {
			a: {
				b: {
					c: 1,
				},
			},
		};
		const expectedOutput = {
			'a.b.c': 1,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle multiple nested keys', () => {
		const input = {
			a: {
				b: 1,
				c: {
					d: 2,
				},
			},
			e: 3,
		};
		const expectedOutput = {
			'a.b': 1,
			'a.c.d': 2,
			e: 3,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should work with arrays', () => {
		const input = {
			a: [1, 2, 3],
			b: {
				c: [4, 5],
			},
		};
		const expectedOutput = {
			'a.0': 1,
			'a.1': 2,
			'a.2': 3,
			'b.c.0': 4,
			'b.c.1': 5,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should return an empty object if input is an empty object', () => {
		const input = {};
		const expectedOutput = {};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle an object with no nesting', () => {
		const input = {
			a: 1,
			b: 2,
		};
		const expectedOutput = {
			a: 1,
			b: 2,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should respect the prefix argument', () => {
		const input = {
			a: {
				b: 1,
			},
		};
		const expectedOutput = {
			'$.a.b': 1,
		};
		expect(flattenObject(input, '$')).toEqual(expectedOutput);
	});

	it('should handle objects with null or undefined values', () => {
		const input = {
			a: null,
			b: {
				c: undefined,
			},
		};
		const expectedOutput = {
			a: null,
			'b.c': undefined,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle complex nested structures', () => {
		const input = {
			a: {
				b: {
					c: {
						d: 1,
					},
				},
				e: [1, { f: 2 }],
			},
		};
		const expectedOutput = {
			'a.b.c.d': 1,
			'a.e.0': 1,
			'a.e.1.f': 2,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle empty arrays', () => {
		const input = {
			a: [],
			b: 1,
		};
		const expectedOutput = {
			b: 1,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle nested empty objects', () => {
		const input = {
			a: {},
			b: 1,
		};
		const expectedOutput = {
			b: 1,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle arrays with mixed types', () => {
		const input = {
			arr: [1, 'string', null, undefined, { nested: true }, [2, 3]],
		};
		const expectedOutput = {
			'arr.0': 1,
			'arr.1': 'string',
			'arr.2': null,
			'arr.3': undefined,
			'arr.4.nested': true,
			'arr.5.0': 2,
			'arr.5.1': 3,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle objects with function values', () => {
		const fn = () => 'test';
		const input = {
			a: fn,
			b: 1,
		};
		const expectedOutput = {
			a: fn,
			b: 1,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle objects with special property names', () => {
		const input = {
			'foo.bar': 1,
			'baz-qux': {
				'inner.key': 2,
			},
		};
		const expectedOutput = {
			'foo.bar': 1,
			'baz-qux.inner.key': 2,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle deeply nested structures without stack overflow', () => {
		let obj: any = { value: 42 };
		for (let i = 0; i < 100; i++) {
			obj = { nested: obj };
		}

		expect(() => flattenObject(obj)).not.toThrow();
		const result = flattenObject(obj);
		const keyPath = Array(100).fill('nested').join('.') + '.value';
		expect(result[keyPath]).toBe(42);
	});

	it('should handle numbers, dates, and other objects', () => {
		// Date and RegExp are objects but have no enumerable own properties, so they flatten to {}
		const date = new Date('2025-01-01');
		const input = {
			a: {
				dateObj: date,
				regExp: /test/g,
			},
		};
		const result = flattenObject(input);
		// Since Date and RegExp have no enumerable own properties, they become empty objects
		// which means no keys are added for them
		expect(result).toEqual({});
	});

	it('should handle array with nested empty objects and arrays', () => {
		const input = {
			arr: [{}, [], { a: 1 }],
		};
		const expectedOutput = {
			'arr.2.a': 1,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should work with custom separator (prefix)', () => {
		const input = {
			a: {
				b: {
					c: 1,
				},
			},
		};
		const expectedOutput = {
			'root.a.b.c': 1,
		};
		expect(flattenObject(input, 'root')).toEqual(expectedOutput);
	});

	it('should handle objects created with Object.create(null)', () => {
		const input = Object.create(null);
		input.a = 1;
		input.b = { c: 2 };

		const expectedOutput = {
			a: 1,
			'b.c': 2,
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle boolean, number, and string primitives mixed with objects', () => {
		const input = {
			bool: true,
			num: 42,
			str: 'hello',
			nested: {
				bool: false,
				num: 0,
				str: '',
			},
		};
		const expectedOutput = {
			bool: true,
			num: 42,
			str: 'hello',
			'nested.bool': false,
			'nested.num': 0,
			'nested.str': '',
		};
		expect(flattenObject(input)).toEqual(expectedOutput);
	});

	it('should handle array with sparse elements (holes)', () => {
		// Note: Sparse arrays are tricky in JS. Object.keys skips holes.
		// This test shows the behavior with actual sparse arrays
		const arr = [1, , 3]; // Middle element is a hole
		const input = { arr };
		const result = flattenObject(input);
		// The hole won't appear because Object.keys skips it
		expect(result).toEqual({ 'arr.0': 1, 'arr.2': 3 });
	});

	it('should handle objects with zero and false values', () => {
		const input = {
			zero: 0,
			false: false,
			empty: '',
			nested: {
				zero: 0,
				false: false,
				empty: '',
			},
		};
		// These should all be included, not treated as falsy
		expect(flattenObject(input)).toEqual({
			zero: 0,
			false: false,
			empty: '',
			'nested.zero': 0,
			'nested.false': false,
			'nested.empty': '',
		});
	});

	it('should handle mixed array and object nesting at multiple levels', () => {
		const input = {
			level1: [
				{
					level2: [
						{ level3: 'deep' },
						'string in array',
					],
				},
				'top level array value',
			],
		};
		const result = flattenObject(input);
		expect(result['level1.0.level2.0.level3']).toBe('deep');
		expect(result['level1.0.level2.1']).toBe('string in array');
		expect(result['level1.1']).toBe('top level array value');
	});
});
