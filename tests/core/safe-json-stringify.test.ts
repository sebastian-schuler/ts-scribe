import { describe, expect, it } from 'bun:test';
import { safeJsonStringify } from '../../src/index.js';

// Helper: normalize whitespace for deep equality checks on pretty-printed JSON
function normalizeJSON(string_: string): string {
	return string_.replaceAll(/\s+/g, ' ').trim();
}

describe('safeJsonStringify', () => {
	it('should serialize basic primitives correctly', () => {
		expect(safeJsonStringify(null)).toBe('null');
		expect(safeJsonStringify(true)).toBe('true');
		expect(safeJsonStringify(42)).toBe('42');
		expect(safeJsonStringify('hello')).toBe('"hello"');
		expect(safeJsonStringify(undefined)).toBeUndefined(); // Matches JSON.stringify
		expect(safeJsonStringify(Symbol('id'))).toBeUndefined();
	});

	it('should serialize plain objects', () => {
		const object = { a: 1, b: 'two', c: null };
		expect(safeJsonStringify(object)).toBe('{"a":1,"b":"two","c":null}');
	});

	it('should handle arrays', () => {
		const array = [1, 'two', { nested: true }];
		expect(safeJsonStringify(array)).toBe('[1,"two",{"nested":true}]');
	});

	it('should replace circular references with "[Circular]"', () => {
		const object: any = { name: 'Alice' };
		object.self = object;

		const result = safeJsonStringify(object);
		expect(result).toBe('{"name":"Alice","self":"[Circular]"}');

		// Nested circular
		const a: any = {};
		const b: any = { a };
		a.b = b;
		expect(safeJsonStringify(a)).toBe('{"b":{"a":"[Circular]"}}');
	});

	it('should handle deep circular structures', () => {
		const root: any = { id: 1 };
		const child1: any = { id: 2, parent: root };
		const child2: any = { id: 3, sibling: child1 };
		root.child1 = child1;
		root.child2 = child2;
		child1.sibling = child2;

		const result = safeJsonStringify(root);
		// We only expect *direct* circulars to be "[Circular]"; deep refs are fine until cycle closes
		// But when child1.parent → root, and root is already in visited, it becomes "[Circular]"
		expect(JSON.parse(result)).toEqual({
			id: 1,
			child1: {
				id: 2,
				parent: '[Circular]',
				sibling: {
					id: 3,
					sibling: '[Circular]',
				},
			},
			child2: {
				id: 3,
				sibling: {
					id: 2,
					parent: '[Circular]',
					sibling: '[Circular]',
				},
			},
		});
	});

	it('should replace throwing getters with "[Throws: <message>]"', () => {
		const object = {
			safe: 'ok',
		};
		Object.defineProperty(object, 'throws', {
			get() {
				throw new Error('Forbidden');
			},
			enumerable: true,
		});

		const result = safeJsonStringify(object);
		expect(result).toBe('{"safe":"ok","throws":"[Throws: Forbidden]"}');
	});

	it('should handle inherited throwing getters', () => {
		const proto = {};
		Object.defineProperty(proto, 'inherited', {
			get() {
				throw new TypeError('nope');
			},
			enumerable: true,
		});

		const object = Object.create(proto);
		object.own = 'yes';

		const result = safeJsonStringify(object);
		expect(result).toBe('{"own":"yes","inherited":"[Throws: nope]"}');
	});

	it('should respect toJSON method', () => {
		class User {
			constructor(
				public id: number,
				public name: string,
			) {}

			toJSON() {
				return { id: this.id, name: this.name.toUpperCase() };
			}
		}

		const user = new User(42, 'alice');
		expect(safeJsonStringify(user)).toBe('{"id":42,"name":"ALICE"}');
	});

	it('should replace throwing toJSON with "[Throws: ...]"', () => {
		class BadSerializer {
			data = 'ok';
			toJSON() {
				throw new Error('Serialization failed');
			}
		}

		const object = new BadSerializer();
		const result = safeJsonStringify(object);
		expect(result).toBe('"[Throws: Serialization failed]"');
	});

	it('should handle toJSON returning circular structure', () => {
		const circular: any = { id: 1 };
		circular.self = circular;

		const object = {
			toJSON() {
				return circular;
			},
		};

		const result = safeJsonStringify(object);
		expect(result).toBe('{"id":1,"self":"[Circular]"}');
	});

	it('should ignore symbol-keyed properties (like JSON.stringify)', () => {
		const sym = Symbol('secret');
		const object = {
			public: 'visible',
			[sym]: 'hidden',
		};
		Object.defineProperty(object, Symbol.iterator, {
			value: () => null,
			enumerable: true,
		});

		expect(safeJsonStringify(object)).toBe('{"public":"visible"}');
	});

	it('should support replacer function', () => {
		const object = { a: 1, b: 2, c: 3 };
		const replacer = (key: string, value: unknown) => (key === 'b' ? undefined : value);

		expect(safeJsonStringify(object, replacer)).toBe('{"a":1,"c":3}');
	});

	it('should support replacer array', () => {
		const object = { a: 1, b: 2, c: 3 };
		expect(safeJsonStringify(object, ['a', 'c'])).toBe('{"a":1,"c":3}');
	});

	it('should support space indentation', () => {
		const object = { a: 1, b: { c: 2 } };
		const expected = `{
 "a": 1,
 "b": {
  "c": 2
 }
}`;
		// @ts-expect-error testing space as number
		const result = safeJsonStringify(object, null, 1);
		expect(normalizeJSON(result)).toBe(normalizeJSON(expected));
	});

	it('should handle null/undefined replacer and space', () => {
		const object = { x: 1 };
		// @ts-expect-error testing null/undefined cases
		expect(safeJsonStringify(object, null, 0)).toBe('{"x":1}');
		expect(safeJsonStringify(object, undefined, undefined)).toBe('{"x":1}');
	});

	it('should not mutate original object', () => {
		const object = { a: 1 };
		Object.defineProperty(object, 'get', {
			get() {
				return 'safe';
			},
			enumerable: true,
		});

		const before = Object.getOwnPropertyDescriptors(object);
		safeJsonStringify(object);
		const after = Object.getOwnPropertyDescriptors(object);

		expect(after).toEqual(before);
	});

	it('should handle Date (toJSON returns ISO string)', () => {
		const now = new Date('2025-01-01T00:00:00Z');
		expect(safeJsonStringify(now)).toBe('"2025-01-01T00:00:00.000Z"');
	});

	it('should handle RegExp (no toJSON, own props only)', () => {
		const re = /abc/g;
		// RegExp has no enumerable own props (lastIndex is not enumerable by default)
		expect(safeJsonStringify(re)).toBe('{}');
	});

	it('should handle Map/Set (treated as plain objects — empty)', () => {
		const map = new Map([['a', 1]]);
		const set = new Set([1, 2]);

		// Maps/Sets have no enumerable own properties → {}
		expect(safeJsonStringify(map)).toBe('{}');
		expect(safeJsonStringify(set)).toBe('{}');
	});

	it('should return undefined for function root values', () => {
		function fn() {}
		fn.prop = 'value';
		expect(safeJsonStringify(fn)).toBeUndefined();
	});

	it('should serialize function objects as empty objects when nested', () => {
		function fn() {}
		const object = { func: fn };
		expect(safeJsonStringify(object)).toBe('{}');
	});

	it('should handle deeply nested mixed structures', () => {
		const object: any = {
			a: [1, 2, { b: Symbol('ignore'), c() {} }],
			d: new Date(0),
		};
		object.circular = object;

		const result = JSON.parse(safeJsonStringify(object));
		expect(result).toEqual({
			a: [1, 2, {}],
			d: '1970-01-01T00:00:00.000Z',
			circular: '[Circular]',
		});
	});

	it('should convert undefined and functions in arrays to null', () => {
		expect(safeJsonStringify([undefined, () => {}, 42])).toBe('[null,null,42]');
	});

	it('should ignore non-enumerable throwing getters', () => {
		const object = {};
		Object.defineProperty(object, 'throws', {
			get() {
				throw new Error('ignored');
			},
			enumerable: false, // ← key difference
		});
		// @ts-expect-error test case
		object.visible = 'ok';
		expect(safeJsonStringify(object)).toBe('{"visible":"ok"}');
	});

	it('should handle Proxy-wrapped objects', () => {
		const target = { a: 1 };
		const proxy = new Proxy(target, {
			get(target, prop) {
				if (prop === 'trap') throw new Error('proxy trap');
				return target[prop as keyof typeof target];
			},
			ownKeys() {
				return ['a', 'trap'] as any;
			},
			getOwnPropertyDescriptor() {
				return { enumerable: true, configurable: true };
			},
		});

		expect(safeJsonStringify({ p: proxy })).toBe('{"p":{"a":1,"trap":"[Throws: proxy trap]"}}');
	});

	it('should handle Object.create(null)', () => {
		const object = Object.create(null);
		object.key = 'value';
		expect(safeJsonStringify(object)).toBe('{"key":"value"}');
	});

	it('should not crash on deeply nested objects (stack safety)', () => {
		let object: any = {};
		for (let i = 0; i < 1000; i++) {
			object = { child: object };
		}

		// Should not throw "Maximum call stack size exceeded"
		expect(() => safeJsonStringify(object)).not.toThrow();
	});

	it('should handle non-Error throws (string, number, null)', () => {
		const object = {
			str: {
				get str() {
					throw 'string error';
				},
			},
			num: {
				get num() {
					throw 42;
				},
			},
			nil: {
				get nil() {
					throw null;
				},
			},
		};
		const result = safeJsonStringify(object);
		expect(result).toContain('"str":"[Throws: string error]"');
		expect(result).toContain('"num":"[Throws: 42]"');
		expect(result).toContain('"nil":"[Throws: null]"');
	});

	it('should allow replacer to modify placeholders', () => {
		const object: any = {};
		object.self = object;
		const replacer = (key: string, value: unknown) => (value === '[Circular]' ? '[CYCLIC]' : value);

		expect(safeJsonStringify(object, replacer)).toBe('{"self":"[CYCLIC]"}');
	});

	it('should handle empty structures', () => {
		expect(safeJsonStringify({})).toBe('{}');
		expect(safeJsonStringify([])).toBe('[]');
		expect(safeJsonStringify(Object.create(null))).toBe('{}');
	});

	it('should handle BigInt values by converting to string placeholder', () => {
		const bigInt = 9007199254740991n;
		expect(safeJsonStringify(bigInt)).toBe('"[BigInt: 9007199254740991]"');

		// BigInt in object
		const object = { id: 1, bigValue: 12345678901234567890n };
		expect(safeJsonStringify(object)).toBe('{"id":1,"bigValue":"[BigInt: 12345678901234567890]"}');

		// BigInt in array
		const array = [1, 2n, 'three'];
		expect(safeJsonStringify(array)).toBe('[1,"[BigInt: 2]","three"]');
	});

	it('should handle nested BigInt values', () => {
		const object = {
			user: {
				id: 123n,
				balance: 999999999999999999n,
			},
			items: [{ price: 100n }, { price: 200n }],
		};

		const result = safeJsonStringify(object);
		const parsed = JSON.parse(result);
		expect(parsed).toEqual({
			user: {
				id: '[BigInt: 123]',
				balance: '[BigInt: 999999999999999999]',
			},
			items: [{ price: '[BigInt: 100]' }, { price: '[BigInt: 200]' }],
		});
	});

	it('should handle throwing replacer function gracefully', () => {
		const object = { a: 1, b: 2 };
		const replacer = (key: string, value: unknown) => {
			if (key === 'b') {
				throw new Error('Replacer rejected key b');
			}
			return value;
		};

		const result = safeJsonStringify(object, replacer);
		expect(result).toBe('"[Throws: Replacer rejected key b]"');
	});

	it('should handle replacer throwing non-Error values', () => {
		const object = { x: 1 };
		const replacer = () => {
			throw 'Custom error string';
		};

		const result = safeJsonStringify(object, replacer);
		expect(result).toBe('"[Throws: Custom error string]"');
	});

	it('should handle BigInt with circular references', () => {
		const object: any = {
			bigNum: 123456789n,
			name: 'test',
		};
		object.self = object;

		const result = safeJsonStringify(object);
		expect(result).toBe('{"bigNum":"[BigInt: 123456789]","name":"test","self":"[Circular]"}');
	});

	it('should handle BigInt in toJSON return value', () => {
		const object = {
			toJSON() {
				return { value: 42n };
			},
		};

		const result = safeJsonStringify(object);
		expect(result).toBe('{"value":"[BigInt: 42]"}');
	});

	
});
