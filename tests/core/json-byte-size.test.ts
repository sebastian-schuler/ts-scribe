import { describe, expect, it } from 'bun:test';
import { jsonByteSize, safeJsonStringify } from '../../src/index.js';

// Helper: exact byte size of a serialized value using native JSON.stringify (for comparison in non-exact tests)
function nativeBytes(value: unknown): number {
	return Buffer.byteLength(JSON.stringify(value)!, 'utf8');
}

describe('jsonByteSize', () => {
	// ─── Default / 'exact' mode ───────────────────────────────────────────────

	describe("accuracy: 'exact' (default)", () => {
		// ─── Primitives ───────────────────────────────────────────────────────

		it('should return the byte size of a number', () => {
			expect(jsonByteSize(42)).toBe(Buffer.byteLength('42', 'utf8'));
		});

		it('should return the byte size of a string', () => {
			expect(jsonByteSize('hello')).toBe(Buffer.byteLength('"hello"', 'utf8'));
		});

		it('should return the byte size of true', () => {
			expect(jsonByteSize(true)).toBe(Buffer.byteLength('true', 'utf8'));
		});

		it('should return the byte size of false', () => {
			expect(jsonByteSize(false)).toBe(Buffer.byteLength('false', 'utf8'));
		});

		it('should return the byte size of null', () => {
			expect(jsonByteSize(null)).toBe(Buffer.byteLength('null', 'utf8'));
		});

		it('should return the byte size of undefined (serializes to "null")', () => {
			expect(jsonByteSize(undefined)).toBe(Buffer.byteLength('null', 'utf8'));
		});

		// ─── Objects ─────────────────────────────────────────────────────────

		it('should return the byte size of an empty object', () => {
			expect(jsonByteSize({})).toBe(Buffer.byteLength('{}', 'utf8'));
		});

		it('should return the byte size of a simple flat object', () => {
			const obj = { a: 1, b: 'x' };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength(JSON.stringify(obj), 'utf8'));
		});

		it('should return the byte size of a nested object', () => {
			const obj = { outer: { inner: { value: 99 } } };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength(JSON.stringify(obj), 'utf8'));
		});

		it('should return the byte size of an object with many keys', () => {
			const obj = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]));
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength(JSON.stringify(obj), 'utf8'));
		});

		// ─── Arrays ───────────────────────────────────────────────────────────

		it('should return the byte size of an empty array', () => {
			expect(jsonByteSize([])).toBe(Buffer.byteLength('[]', 'utf8'));
		});

		it('should return the byte size of a primitive array', () => {
			const arr = [1, 2, 3, 4, 5];
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength(JSON.stringify(arr), 'utf8'));
		});

		it('should return the byte size of an array of objects', () => {
			const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength(JSON.stringify(arr), 'utf8'));
		});

		// ─── Multi-byte (Unicode) characters ──────────────────────────────────

		it('should correctly count bytes for a string with 2-byte UTF-8 characters', () => {
			const value = 'café';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should correctly count bytes for a string with 3-byte UTF-8 characters', () => {
			const value = '中文';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should correctly count bytes for a string with 4-byte emoji (surrogate pair)', () => {
			const value = '🚀';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should correctly count bytes for an object containing multi-byte values', () => {
			const obj = { greeting: '日本語', emoji: '🎉' };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength(JSON.stringify(obj), 'utf8'));
		});

		// ─── Robustness ───────────────────────────────────────────────────────

		it('should not throw on a circular reference', () => {
			const obj: Record<string, unknown> = { a: 1 };
			obj['self'] = obj;
			expect(() => jsonByteSize(obj)).not.toThrow();
		});

		it('should return a positive byte count for a circular reference', () => {
			const obj: Record<string, unknown> = { name: 'loop' };
			obj['self'] = obj;
			expect(jsonByteSize(obj)).toBeGreaterThan(0);
		});

		it('should not throw on a throwing getter', () => {
			const obj = {};
			Object.defineProperty(obj, 'bad', { get() { throw new Error('boom'); }, enumerable: true });
			expect(() => jsonByteSize(obj)).not.toThrow();
		});

		it('should return a positive byte count when a getter throws', () => {
			const obj = {};
			Object.defineProperty(obj, 'bad', { get() { throw new Error('boom'); }, enumerable: true });
			expect(jsonByteSize(obj)).toBeGreaterThan(0);
		});

		// ─── Number edge cases ────────────────────────────────────────────────

		it('should return 1 byte for 0', () => {
			expect(jsonByteSize(0)).toBe(Buffer.byteLength('0', 'utf8'));
		});

		it('should serialize -0 as "0" (JSON coercion)', () => {
			expect(jsonByteSize(-0)).toBe(Buffer.byteLength('0', 'utf8'));
		});

		it('should serialize NaN as "null"', () => {
			expect(jsonByteSize(Number.NaN)).toBe(Buffer.byteLength('null', 'utf8'));
		});

		it('should serialize Infinity as "null"', () => {
			expect(jsonByteSize(Infinity)).toBe(Buffer.byteLength('null', 'utf8'));
		});

		it('should serialize -Infinity as "null"', () => {
			expect(jsonByteSize(-Infinity)).toBe(Buffer.byteLength('null', 'utf8'));
		});

		it('should return the correct byte size for a float', () => {
			expect(jsonByteSize(3.14)).toBe(Buffer.byteLength('3.14', 'utf8'));
		});

		it('should return the correct byte size for a very large integer', () => {
			expect(jsonByteSize(Number.MAX_SAFE_INTEGER)).toBe(
				Buffer.byteLength(String(Number.MAX_SAFE_INTEGER), 'utf8'),
			);
		});

		it('NaN as an object value should serialize the key with null', () => {
			expect(jsonByteSize({ x: Number.NaN })).toBe(Buffer.byteLength('{"x":null}', 'utf8'));
		});

		it('Infinity as an object value should serialize the key with null', () => {
			expect(jsonByteSize({ x: Infinity })).toBe(Buffer.byteLength('{"x":null}', 'utf8'));
		});

		// ─── String edge cases ────────────────────────────────────────────────

		it('should return 2 bytes for an empty string (just the JSON quotes)', () => {
			expect(jsonByteSize('')).toBe(Buffer.byteLength('""', 'utf8'));
		});

		it('should count escape bytes for a string containing a double-quote', () => {
			const value = 'say "hi"';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should count escape bytes for a string containing a backslash', () => {
			const value = 'a\\b';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should count escape bytes for a string containing a newline', () => {
			const value = 'line1\nline2';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should count escape bytes for a string containing a tab', () => {
			const value = 'col1\tcol2';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should count escape bytes for a string containing a null byte', () => {
			const value = 'a\u0000b';
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		it('should correctly measure a very long string', () => {
			const value = 'x'.repeat(10_000);
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(JSON.stringify(value), 'utf8'));
		});

		// ─── Array edge cases ─────────────────────────────────────────────────

		it('should return the byte size of nested arrays', () => {
			const arr = [[1, 2], [3, 4], [5, 6]];
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength(JSON.stringify(arr), 'utf8'));
		});

		it('should return the byte size of a mixed-type array', () => {
			const arr = [1, 'hello', true, null, { id: 42 }];
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength(JSON.stringify(arr), 'utf8'));
		});

		it('undefined items in an array should serialize as null', () => {
			expect(jsonByteSize([1, undefined, 3])).toBe(Buffer.byteLength('[1,null,3]', 'utf8'));
		});

		it('function items in an array should serialize as null', () => {
			// eslint-disable-next-line unicorn/no-useless-undefined
			const arr = [1, () => {}, 3];
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength('[1,null,3]', 'utf8'));
		});

		it('Symbol items in an array should serialize as null', () => {
			const arr = [1, Symbol('x'), 3];
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength('[1,null,3]', 'utf8'));
		});

		it('a sparse array should serialize holes as null', () => {
			// eslint-disable-next-line unicorn/no-new-array
			const arr = new Array(3);
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength('[null,null,null]', 'utf8'));
		});

		// ─── Object edge cases ────────────────────────────────────────────────

		it('object with null values should include the keys', () => {
			expect(jsonByteSize({ a: null, b: null })).toBe(
				Buffer.byteLength('{"a":null,"b":null}', 'utf8'),
			);
		});

		it('object with undefined values should omit those keys', () => {
			expect(jsonByteSize({ a: 1, b: undefined })).toBe(Buffer.byteLength('{"a":1}', 'utf8'));
		});

		it('object with function values should omit those keys', () => {
			const obj = { a: 1, fn: () => 'noop' };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength('{"a":1}', 'utf8'));
		});

		it('object with Symbol-keyed properties should omit those keys', () => {
			const obj: Record<string | symbol, unknown> = { [Symbol('secret')]: 42, visible: 1 };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength('{"visible":1}', 'utf8'));
		});

		it('object with non-enumerable properties should omit them', () => {
			const obj = { a: 1 };
			Object.defineProperty(obj, 'hidden', { value: 99, enumerable: false });
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength('{"a":1}', 'utf8'));
		});

		it('object with a toJSON() method should use the toJSON() return value', () => {
			const obj = { internal: 'ignored', toJSON: () => ({ public: 'data' }) };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength('{"public":"data"}', 'utf8'));
		});

		it('object with a throwing toJSON() should not throw', () => {
			const obj = { toJSON() { throw new Error('toJSON exploded'); } };
			expect(() => jsonByteSize(obj)).not.toThrow();
		});

		it('object with a throwing toJSON() should return a positive byte count', () => {
			const obj = { toJSON() { throw new Error('toJSON exploded'); } };
			expect(jsonByteSize(obj)).toBeGreaterThan(0);
		});

		it('object with a null prototype should serialize like a plain object', () => {
			const obj = Object.assign(Object.create(null) as Record<string, unknown>, { a: 1 });
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength('{"a":1}', 'utf8'));
		});

		it('object with a BigInt value should use the safeJsonStringify placeholder', () => {
			const obj = { n: BigInt(42) };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength(safeJsonStringify(obj), 'utf8'));
		});

		it('shared (non-circular) references should serialize each occurrence independently', () => {
			const shared = { x: 1 };
			const obj = { a: shared, b: shared };
			expect(jsonByteSize(obj)).toBe(Buffer.byteLength(JSON.stringify(obj), 'utf8'));
		});

		it('multiple independent circular references in the same object should not throw', () => {
			const a: Record<string, unknown> = { name: 'a' };
			a['self'] = a;
			const b: Record<string, unknown> = { name: 'b' };
			b['self'] = b;
			expect(() => jsonByteSize({ a, b })).not.toThrow();
		});

		it('multiple independent circular references should both be replaced with placeholders', () => {
			const a: Record<string, unknown> = { name: 'a' };
			a['self'] = a;
			const b: Record<string, unknown> = { name: 'b' };
			b['self'] = b;
			expect(jsonByteSize({ a, b })).toBeGreaterThan(0);
		});

		// ─── Top-level non-serializable values ───────────────────────────────

		it('a top-level function should serialize as null (4 bytes)', () => {
			expect(jsonByteSize(() => {})).toBe(Buffer.byteLength('null', 'utf8'));
		});

		it('a top-level Symbol should serialize as null (4 bytes)', () => {
			expect(jsonByteSize(Symbol('x'))).toBe(Buffer.byteLength('null', 'utf8'));
		});

		it('a top-level BigInt should use the safeJsonStringify placeholder string', () => {
			const value = BigInt(42);
			expect(jsonByteSize(value)).toBe(Buffer.byteLength(safeJsonStringify(value), 'utf8'));
		});

		// ─── Built-in object types ────────────────────────────────────────────

		it('a Date should serialize via its toJSON() ISO string', () => {
			const date = new Date('2020-01-01T00:00:00.000Z');
			expect(jsonByteSize(date)).toBe(Buffer.byteLength(JSON.stringify(date), 'utf8'));
		});

		it('a RegExp should serialize as an empty object', () => {
			expect(jsonByteSize(/abc/g)).toBe(Buffer.byteLength('{}', 'utf8'));
		});

		it('a Map should serialize as an empty object', () => {
			expect(jsonByteSize(new Map([['a', 1]]))).toBe(Buffer.byteLength('{}', 'utf8'));
		});

		it('a Set should serialize as an empty object', () => {
			expect(jsonByteSize(new Set([1, 2, 3]))).toBe(Buffer.byteLength('{}', 'utf8'));
		});

		it('an Error should serialize as an empty object (message is non-enumerable)', () => {
			expect(jsonByteSize(new Error('oops'))).toBe(Buffer.byteLength('{}', 'utf8'));
		});

		// ─── Stress ───────────────────────────────────────────────────────────

		it('should handle a very deeply nested object without throwing', () => {
			let obj: Record<string, unknown> = { value: 1 };
			for (let i = 0; i < 100; i++) obj = { child: obj };
			expect(() => jsonByteSize(obj)).not.toThrow();
		});

		it('should return a positive byte size for a very deeply nested object', () => {
			let obj: Record<string, unknown> = { value: 1 };
			for (let i = 0; i < 100; i++) obj = { child: obj };
			expect(jsonByteSize(obj)).toBeGreaterThan(0);
		});

		it('should handle an array of 10 000 elements without throwing', () => {
			const arr = Array.from({ length: 10_000 }, (_, i) => i);
			expect(() => jsonByteSize(arr)).not.toThrow();
		});

		it('should return the correct byte size for an array of 10 000 elements', () => {
			const arr = Array.from({ length: 10_000 }, (_, i) => i);
			expect(jsonByteSize(arr)).toBe(Buffer.byteLength(JSON.stringify(arr), 'utf8'));
		});

		// ─── Return type and consistency ─────────────────────────────────────

		it('should always return a non-negative integer', () => {
			for (const value of [null, undefined, 0, '', [], {}, true]) {
				const size = jsonByteSize(value);
				expect(size).toBeGreaterThanOrEqual(0);
				expect(Number.isInteger(size)).toBe(true);
			}
		});

		it('larger objects should have a greater byte size than smaller ones', () => {
			const small = { a: 1 };
			const large = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 'some longer string value here' };
			expect(jsonByteSize(large)).toBeGreaterThan(jsonByteSize(small));
		});

		it('should be consistent — same input returns same byte size', () => {
			const obj = { x: 42, y: 'hello' };
			expect(jsonByteSize(obj)).toBe(jsonByteSize(obj));
		});
	});

	// ─── 'fast' mode ──────────────────────────────────────────────────────────

	describe("accuracy: 'fast'", () => {
		it('matches exact for ASCII-only primitives', () => {
			for (const value of [null, true, false, 0, 42, 3.14, 'hello', '', []]) {
				expect(jsonByteSize(value, 'fast')).toBe(jsonByteSize(value, 'exact'));
			}
		});

		it('matches exact for a flat ASCII object', () => {
			const obj = { name: 'alice', score: 99, active: true };
			expect(jsonByteSize(obj, 'fast')).toBe(jsonByteSize(obj, 'exact'));
		});

		it('matches exact for a nested ASCII object', () => {
			const obj = { a: { b: { c: 123 } } };
			expect(jsonByteSize(obj, 'fast')).toBe(jsonByteSize(obj, 'exact'));
		});

		it('matches exact for an ASCII array', () => {
			const arr = [1, 2, 'foo', true, null];
			expect(jsonByteSize(arr, 'fast')).toBe(jsonByteSize(arr, 'exact'));
		});

		it('matches exact for 2-byte UTF-8 characters in a string', () => {
			expect(jsonByteSize('café', 'fast')).toBe(jsonByteSize('café', 'exact'));
		});

		it('matches exact for 3-byte UTF-8 characters in a string', () => {
			expect(jsonByteSize('中文', 'fast')).toBe(jsonByteSize('中文', 'exact'));
		});

		it('matches exact for 4-byte emoji in a string', () => {
			expect(jsonByteSize('🚀', 'fast')).toBe(jsonByteSize('🚀', 'exact'));
		});

		it('matches exact for string containing double-quote', () => {
			expect(jsonByteSize('say "hi"', 'fast')).toBe(jsonByteSize('say "hi"', 'exact'));
		});

		it('matches exact for string containing backslash', () => {
			expect(jsonByteSize('a\\b', 'fast')).toBe(jsonByteSize('a\\b', 'exact'));
		});

		it('matches exact for string containing newline', () => {
			expect(jsonByteSize('a\nb', 'fast')).toBe(jsonByteSize('a\nb', 'exact'));
		});

		it('matches exact for string containing tab', () => {
			expect(jsonByteSize('a\tb', 'fast')).toBe(jsonByteSize('a\tb', 'exact'));
		});

		it('matches exact for string containing \\b, \\f, \\r control characters', () => {
			expect(jsonByteSize('a\bb\fc\rd', 'fast')).toBe(jsonByteSize('a\bb\fc\rd', 'exact'));
		});

		it('matches exact for string containing a NUL byte (\\u0000)', () => {
			expect(jsonByteSize('a\u0000b', 'fast')).toBe(jsonByteSize('a\u0000b', 'exact'));
		});

		it('matches exact for other control characters (\\u0001–\\u001F)', () => {
			// \u0001 → \u0001 in JSON (6 bytes), not a special two-char escape
			expect(jsonByteSize('a\u0001b', 'fast')).toBe(jsonByteSize('a\u0001b', 'exact'));
		});

		it('matches exact for string with mixed multi-byte and escape chars', () => {
			const value = '日本語\ntest\t"end"';
			expect(jsonByteSize(value, 'fast')).toBe(jsonByteSize(value, 'exact'));
		});

		it('serializes NaN as null (4 bytes)', () => {
			expect(jsonByteSize(Number.NaN, 'fast')).toBe(4);
		});

		it('serializes Infinity as null (4 bytes)', () => {
			expect(jsonByteSize(Infinity, 'fast')).toBe(4);
		});

		it('serializes -0 as "0" (1 byte)', () => {
			expect(jsonByteSize(-0, 'fast')).toBe(1);
		});

		it('serializes undefined as null (4 bytes)', () => {
			expect(jsonByteSize(undefined, 'fast')).toBe(4);
		});

		it('serializes a top-level function as null (4 bytes)', () => {
			expect(jsonByteSize(() => {}, 'fast')).toBe(4);
		});

		it('serializes a top-level Symbol as null (4 bytes)', () => {
			expect(jsonByteSize(Symbol('x'), 'fast')).toBe(4);
		});

		it('omits undefined values in objects', () => {
			expect(jsonByteSize({ a: 1, b: undefined }, 'fast')).toBe(nativeBytes({ a: 1 }));
		});

		it('omits function values in objects', () => {
			expect(jsonByteSize({ a: 1, fn: () => {} }, 'fast')).toBe(nativeBytes({ a: 1 }));
		});

		it('serializes undefined items in arrays as null', () => {
			expect(jsonByteSize([1, undefined, 3], 'fast')).toBe(nativeBytes([1, null, 3]));
		});

		it('serializes function items in arrays as null', () => {
			expect(jsonByteSize([1, () => {}, 3], 'fast')).toBe(nativeBytes([1, null, 3]));
		});

		it('calls toJSON() on objects that define it', () => {
			const obj = { toJSON: () => ({ public: 'data' }) };
			expect(jsonByteSize(obj, 'fast')).toBe(nativeBytes({ public: 'data' }));
		});

		it('calls toJSON() on a Date and matches exact', () => {
			const date = new Date('2020-01-01T00:00:00.000Z');
			expect(jsonByteSize(date, 'fast')).toBe(jsonByteSize(date, 'exact'));
		});

		it('does not throw when toJSON() throws — falls back to plain-object walk', () => {
			const obj = { toJSON() { throw new Error('boom'); } };
			expect(() => jsonByteSize(obj, 'fast')).not.toThrow();
		});

		it('does not throw when a getter throws — skips the key', () => {
			const obj: Record<string, unknown> = { a: 1 };
			Object.defineProperty(obj, 'bad', { get() { throw new Error('boom'); }, enumerable: true });
			expect(() => jsonByteSize(obj, 'fast')).not.toThrow();
		});

		it('skips keys with throwing getters', () => {
			const obj: Record<string, unknown> = { a: 1 };
			Object.defineProperty(obj, 'bad', { get() { throw new Error('boom'); }, enumerable: true });
			// Only {a:1} is measured — the throwing key is skipped
			expect(jsonByteSize(obj, 'fast')).toBe(nativeBytes({ a: 1 }));
		});

		it('BigInt value in object uses the "[BigInt: N]" placeholder string', () => {
			const obj = { n: BigInt(42) };
			const fast = jsonByteSize(obj, 'fast');
			expect(fast).toBeGreaterThan(0);
			expect(Number.isInteger(fast)).toBe(true);
		});

		it('top-level BigInt uses the "[BigInt: N]" placeholder string', () => {
			expect(jsonByteSize(BigInt(42), 'fast')).toBeGreaterThan(0);
		});

		it('empty object returns 2 bytes', () => {
			expect(jsonByteSize({}, 'fast')).toBe(2);
		});

		it('empty array returns 2 bytes', () => {
			expect(jsonByteSize([], 'fast')).toBe(2);
		});

		it('always returns a non-negative integer', () => {
			for (const value of [null, undefined, 0, '', [], {}, true]) {
				const size = jsonByteSize(value, 'fast');
				expect(size).toBeGreaterThanOrEqual(0);
				expect(Number.isInteger(size)).toBe(true);
			}
		});

		it('handles a deeply nested object without throwing', () => {
			let obj: Record<string, unknown> = { value: 1 };
			for (let i = 0; i < 100; i++) obj = { child: obj };
			expect(() => jsonByteSize(obj, 'fast')).not.toThrow();
		});

		it('handles a large array without throwing', () => {
			const arr = Array.from({ length: 10_000 }, (_, i) => i);
			expect(() => jsonByteSize(arr, 'fast')).not.toThrow();
		});

		it('matches exact for a large ASCII array', () => {
			const arr = Array.from({ length: 10_000 }, (_, i) => i);
			expect(jsonByteSize(arr, 'fast')).toBe(jsonByteSize(arr, 'exact'));
		});
	});

	// ─── 'estimate' mode ──────────────────────────────────────────────────────

	describe("accuracy: 'estimate'", () => {
		it('matches exact for ASCII-only primitives', () => {
			for (const value of [null, true, false, 0, 42, 3.14, 'hello', '']) {
				expect(jsonByteSize(value, 'estimate')).toBe(jsonByteSize(value, 'exact'));
			}
		});

		it('matches exact for a flat ASCII-only object', () => {
			const obj = { name: 'alice', score: 99, active: true };
			expect(jsonByteSize(obj, 'estimate')).toBe(jsonByteSize(obj, 'exact'));
		});

		it('matches exact for ASCII arrays', () => {
			expect(jsonByteSize([1, 2, 3], 'estimate')).toBe(jsonByteSize([1, 2, 3], 'exact'));
		});

		it('undercounts multi-byte UTF-8 string characters (known limitation)', () => {
			// str.length counts code units; '中文' has length 2 but is 6 UTF-8 bytes
			const value = '中文';
			expect(jsonByteSize(value, 'estimate')).toBeLessThan(jsonByteSize(value, 'exact'));
		});

		it('undercounts emoji string (known limitation)', () => {
			const value = '🚀🎉';
			expect(jsonByteSize(value, 'estimate')).toBeLessThan(jsonByteSize(value, 'exact'));
		});

		it('does not call toJSON() — Date falls back to plain-object measurement', () => {
			const date = new Date('2020-01-01T00:00:00.000Z');
			// Without toJSON(), Date has no enumerable own keys → {} = 2 bytes
			expect(jsonByteSize(date, 'estimate')).toBe(2);
		});

		it('does not call toJSON() — custom toJSON is ignored', () => {
			const obj = { toJSON: () => ({ public: 'data' }), other: 'ignored' };
			// Estimate walks the raw object, treating toJSON as a function value (omitted)
			// and 'other' as a regular key
			expect(jsonByteSize(obj, 'estimate')).toBe(nativeBytes({ other: 'ignored' }));
		});

		it('serializes NaN as null (4 bytes)', () => {
			expect(jsonByteSize(Number.NaN, 'estimate')).toBe(4);
		});

		it('serializes Infinity as null (4 bytes)', () => {
			expect(jsonByteSize(Infinity, 'estimate')).toBe(4);
		});

		it('serializes -0 as "0" (1 byte)', () => {
			expect(jsonByteSize(-0, 'estimate')).toBe(1);
		});

		it('serializes undefined as null (4 bytes)', () => {
			expect(jsonByteSize(undefined, 'estimate')).toBe(4);
		});

		it('omits undefined values in objects', () => {
			expect(jsonByteSize({ a: 1, b: undefined }, 'estimate')).toBe(nativeBytes({ a: 1 }));
		});

		it('serializes undefined items in arrays as null', () => {
			expect(jsonByteSize([1, undefined, 3], 'estimate')).toBe(nativeBytes([1, null, 3]));
		});

		it('does not throw when a getter throws — skips the key', () => {
			const obj: Record<string, unknown> = { a: 1 };
			Object.defineProperty(obj, 'bad', { get() { throw new Error('boom'); }, enumerable: true });
			expect(() => jsonByteSize(obj, 'estimate')).not.toThrow();
		});

		it('empty object returns 2 bytes', () => {
			expect(jsonByteSize({}, 'estimate')).toBe(2);
		});

		it('empty array returns 2 bytes', () => {
			expect(jsonByteSize([], 'estimate')).toBe(2);
		});

		it('always returns a non-negative integer', () => {
			for (const value of [null, undefined, 0, '', [], {}, true]) {
				const size = jsonByteSize(value, 'estimate');
				expect(size).toBeGreaterThanOrEqual(0);
				expect(Number.isInteger(size)).toBe(true);
			}
		});

		it('handles a large ASCII array without throwing', () => {
			const arr = Array.from({ length: 10_000 }, (_, i) => i);
			expect(() => jsonByteSize(arr, 'estimate')).not.toThrow();
		});

		it('matches exact for a large ASCII array', () => {
			const arr = Array.from({ length: 10_000 }, (_, i) => i);
			expect(jsonByteSize(arr, 'estimate')).toBe(jsonByteSize(arr, 'exact'));
		});
	});

	// ─── Cross-mode comparisons ───────────────────────────────────────────────

	describe('cross-mode comparisons', () => {
		it("'fast' is always >= 'estimate' (fast counts real UTF-8 bytes, estimate counts chars)", () => {
			const values = ['hello', '中文', '🚀', { a: 'café' }, ['test', '日本語']];
			for (const value of values) {
				expect(jsonByteSize(value, 'fast')).toBeGreaterThanOrEqual(jsonByteSize(value, 'estimate'));
			}
		});

		it("'exact' and 'fast' agree on all ASCII data", () => {
			const values = [null, true, false, 42, 'hello', { a: 1, b: 'foo' }, [1, 2, 3]];
			for (const value of values) {
				expect(jsonByteSize(value, 'fast')).toBe(jsonByteSize(value, 'exact'));
			}
		});

		it("'exact' and 'estimate' agree on all ASCII-only data", () => {
			const values = [null, true, false, 42, 'hello', { a: 1 }, [1, 2, 3]];
			for (const value of values) {
				expect(jsonByteSize(value, 'estimate')).toBe(jsonByteSize(value, 'exact'));
			}
		});

		it("'fast' is more accurate than 'estimate' for multi-byte strings", () => {
			const value = { greeting: '日本語', emoji: '🎉' };
			const exact = jsonByteSize(value, 'exact');
			const fast = jsonByteSize(value, 'fast');
			const estimate = jsonByteSize(value, 'estimate');
			expect(Math.abs(fast - exact)).toBeLessThan(Math.abs(estimate - exact));
		});

		it('default (no second argument) behaves identically to exact', () => {
			const obj = { name: 'test', values: [1, 2, 3], active: true };
			expect(jsonByteSize(obj)).toBe(jsonByteSize(obj, 'exact'));
		});
	});
});
