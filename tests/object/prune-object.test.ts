import { describe, expect, it } from 'bun:test';
import { pruneObject } from '../../src/object/index.js';

describe('pruneObject', () => {
	describe('flat objects', () => {
		it('should remove undefined values', () => {
			const input = { a: 1, b: undefined, c: 'test', d: null };
			const expected = { a: 1, c: 'test', d: null };
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject(input)).toEqual(expected);
		});

		it('should keep null values', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ a: null, b: undefined })).toEqual({ a: null });
		});

		it('should keep all falsy non-undefined values (false, 0, empty string, NaN, 0n)', () => {
			const input = { a: false, b: 0, c: '', d: Number.NaN, e: 0n, f: undefined };
			const expected = { a: false, b: 0, c: '', d: Number.NaN, e: 0n };
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject(input)).toEqual(expected);
		});

		it('should keep Infinity and -Infinity', () => {
			expect(pruneObject({ a: Number.POSITIVE_INFINITY, b: Number.NEGATIVE_INFINITY })).toEqual({
				a: Number.POSITIVE_INFINITY,
				b: Number.NEGATIVE_INFINITY,
			});
		});

		it('should keep -0', () => {
			expect(Object.is((pruneObject({ a: -0 }) as { a: number }).a, -0)).toBe(true);
		});

		it('should return an empty object if all values are undefined', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ a: undefined, b: undefined })).toEqual({});
		});

		it('should return the same object shape when no values are undefined', () => {
			expect(pruneObject({ a: 1, b: 'foo', c: true })).toEqual({ a: 1, b: 'foo', c: true });
		});

		it('should return an empty object for an empty input', () => {
			expect(pruneObject({})).toEqual({});
		});
	});

	describe('nested objects', () => {
		it('should remove undefined values recursively', () => {
			const input = { a: 1, b: undefined, c: { d: undefined, e: 'nested', f: { g: undefined, h: 'deep' } } };
			const expected = { a: 1, c: { e: 'nested', f: { h: 'deep' } } };
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject(input)).toEqual(expected);
		});

		it('should keep nested objects that become empty after pruning', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ a: { b: undefined } })).toEqual({ a: {} });
		});

		it('should handle deeply nested undefined at multiple levels', () => {
			const input = { a: { b: { c: { d: undefined } } } };
			const expected = { a: { b: { c: {} } } };
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject(input)).toEqual(expected);
		});
	});

	describe('arrays', () => {
		it('should remove undefined values from a flat array', () => {
			expect(pruneObject([1, undefined, 2, undefined, 3])).toEqual([1, 2, 3]);
		});

		it('should return an empty array if all elements are undefined', () => {
			expect(pruneObject([undefined, undefined])).toEqual([]);
		});

		it('should keep null values in arrays', () => {
			expect(pruneObject([1, null, 2])).toEqual([1, null, 2]);
		});

		it('should keep falsy non-undefined values in arrays', () => {
			expect(pruneObject([0, false, '', Number.NaN, null])).toEqual([0, false, '', Number.NaN, null]);
		});

		it('should recursively compact nested arrays', () => {
			expect(pruneObject([[undefined, 1], [2, undefined]])).toEqual([[1], [2]]);
		});

		it('should keep nested arrays that become empty after pruning', () => {
			expect(pruneObject([[undefined, undefined], [1]])).toEqual([[], [1]]);
		});

		it('should handle sparse arrays by treating holes as undefined', () => {
			// eslint-disable-next-line no-sparse-arrays
			expect(pruneObject([1, , 3])).toEqual([1, 3]);
		});

		it('should return all elements unchanged when none are undefined', () => {
			expect(pruneObject([1, null, false, '', 0])).toEqual([1, null, false, '', 0]);
		});

		it('should return an empty array for an empty input', () => {
			expect(pruneObject([])).toEqual([]);
		});
	});

	describe('mixed objects and arrays', () => {
		it('should recursively compact objects inside arrays', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject([{ a: undefined, b: 1 }, null])).toEqual([{ b: 1 }, null]);
		});

		it('should recursively compact arrays inside objects', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ a: [1, undefined, 2], b: undefined })).toEqual({ a: [1, 2] });
		});

		it('should handle complex deeply nested structures', () => {
			const input = { a: [{ b: undefined, c: 'value', d: [undefined, { e: undefined, f: 'deep' }] }], g: undefined };
			const expected = { a: [{ c: 'value', d: [{ f: 'deep' }] }] };
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject(input)).toEqual(expected);
		});
	});

	describe('special values', () => {
		it('should preserve Date instances without recursing into them', () => {
			const date = new Date('2026-01-01');
			expect(pruneObject({ d: date })).toEqual({ d: date });
		});

		it('should preserve RegExp instances without recursing into them', () => {
			const re = /foo/gi;
			expect((pruneObject({ re }) as { re: RegExp }).re).toBe(re);
		});

		it('should preserve function values', () => {
			const fn = () => 42;
			expect((pruneObject({ fn }) as { fn: typeof fn }).fn).toBe(fn);
		});

		it('should drop symbol-keyed properties (not visited by for...in)', () => {
			const sym = Symbol('key');
			const input = Object.assign({ a: 1 }, { [sym]: 'value' });
			const result = pruneObject(input);
			// @ts-expect-error testing should resolve in an error
			expect(result).toEqual({ a: 1 });
			expect(Object.getOwnPropertySymbols(result)).toHaveLength(0);
		});

		it('should not include inherited enumerable properties', () => {
			const proto = { inherited: 'yes' };
			const input = Object.assign(Object.create(proto) as Record<string, unknown>, { own: 1 });
			expect(pruneObject(input)).toEqual({ own: 1 });
		});

		it('should handle class instances by treating them as plain objects', () => {
			class Point {
				x: number;
				y: number | undefined;
				constructor(x: number, y?: number) {
					this.x = x;
					this.y = y;
				}
			}

			// @ts-expect-error testing should resolve in an error
			expect(pruneObject(new Point(1))).toEqual({ x: 1 });
		});

		it('should treat Map instances as plain objects (becomes {})', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ m: new Map([['a', 1]]) })).toEqual({ m: {} });
		});

		it('should treat Set instances as plain objects (becomes {})', () => {
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ s: new Set([1, 2]) })).toEqual({ s: {} });
		});

		it('should preserve Date instances inside arrays', () => {
			const date = new Date('2026-01-01');
			expect(pruneObject([date, undefined, 1])).toEqual([date, 1]);
		});

		it('should preserve RegExp instances inside arrays', () => {
			const re = /foo/;
			expect(pruneObject([re, undefined, 1])).toEqual([re, 1]);
		});

		it('should preserve Date alongside sibling undefined in nested object', () => {
			const date = new Date('2026-01-01');
			// @ts-expect-error testing should resolve in an error
			expect(pruneObject({ a: { d: date, x: undefined } })).toEqual({ a: { d: date } });
		});
	});

	describe('top-level primitives', () => {
		it('should return null as-is', () => {
			expect(pruneObject(null)).toBe(null);
		});

		it('should return undefined as-is', () => {
			expect(pruneObject(undefined)).toBe(undefined);
		});

		it('should return a number as-is', () => {
			expect(pruneObject(42)).toBe(42);
		});

		it('should return a string as-is', () => {
			expect(pruneObject('hello')).toBe('hello');
		});

		it('should return a boolean as-is', () => {
			expect(pruneObject(false)).toBe(false);
		});

		it('should return a bigint as-is', () => {
			expect(pruneObject(42n)).toBe(42n);
		});

		it('should return a symbol as-is', () => {
			const sym = Symbol('test');
			expect(pruneObject(sym)).toBe(sym);
		});
	});

	describe('immutability', () => {
		it('should not mutate the original object', () => {
			const input = { a: undefined, b: 1 };
			const inputCopy = { ...input };
			pruneObject(input);
			expect(input).toEqual(inputCopy);
		});

		it('should not mutate the original array', () => {
			const input = [1, undefined, 2];
			const inputCopy = [...input];
			pruneObject(input);
			expect(input).toEqual(inputCopy);
		});

		it('should return a new object reference, not the original', () => {
			const input = { a: 1 };
			expect(pruneObject(input)).not.toBe(input);
		});

		it('should return a new array reference, not the original', () => {
			const input = [1, 2];
			expect(pruneObject(input)).not.toBe(input);
		});
	});

	describe('options', () => {
		describe('deep', () => {
			it('should not recurse into nested objects when deep: false', () => {
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ a: { b: undefined }, c: undefined }, { deep: false })).toEqual({ a: { b: undefined } });
			});

			it('should not recurse into nested arrays when deep: false', () => {
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ a: [undefined, 1], b: undefined }, { deep: false })).toEqual({ a: [undefined, 1] });
			});

			it('should still filter top-level array items when deep: false', () => {
				expect(pruneObject([undefined, 1, undefined, { a: undefined }], { deep: false })).toEqual([1, { a: undefined }]);
			});

			it('should do nothing extra with deep: false and arrays: false', () => {
				// Only top-level undefined object keys removed; nothing else touched
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ a: [undefined, 1], b: { c: undefined }, d: undefined }, { deep: false, arrays: false })).toEqual({ a: [undefined, 1], b: { c: undefined } });
			});
		});

		describe('arrays', () => {
			it('should return arrays as-is when arrays: false', () => {
				const input = [1, undefined, 2];
				expect(pruneObject(input, { arrays: false })).toBe(input);
			});

			it('should leave object-valued array properties untouched when arrays: false', () => {
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ a: [undefined, 1], b: undefined }, { arrays: false })).toEqual({ a: [undefined, 1] });
			});

			it('should still prune nested objects when arrays: false and deep: true', () => {
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ a: { b: undefined, c: 1 }, d: [undefined, 2] }, { arrays: false })).toEqual({ a: { c: 1 }, d: [undefined, 2] });
			});

			it('should leave nested arrays untouched when arrays: false', () => {
				expect(pruneObject([[undefined, 1], [2, undefined]], { arrays: false })).toEqual([[undefined, 1], [2, undefined]]);
			});
		});

		describe('preserveDate', () => {
			it('should preserve Date instances by default', () => {
				const date = new Date('2026-01-01');
				const result = pruneObject({ d: date, x: undefined });
				expect((result as { d: Date }).d).toBe(date);
			});

			it('should treat Date as a plain object when preserveDate: false', () => {
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ d: new Date() }, { preserveDate: false })).toEqual({ d: {} });
			});
		});

		describe('preserveRegExp', () => {
			it('should preserve RegExp instances by default', () => {
				const re = /foo/gi;
				expect((pruneObject({ re }) as { re: RegExp }).re).toBe(re);
			});

			it('should treat RegExp as a plain object when preserveRegExp: false', () => {
				// @ts-expect-error testing should resolve in an error
				expect(pruneObject({ re: /foo/ }, { preserveRegExp: false })).toEqual({ re: {} });
			});
		});
	});
});
