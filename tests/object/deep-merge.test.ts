import { describe, expect, it } from 'bun:test';
import { objectDeepMerge } from '../../src/object/index.js';

describe('objectDeepMerge', () => {
	// -----------------------------------------------------------------------
	// Primitives & null
	// -----------------------------------------------------------------------

	it('returns the second primitive as-is (B wins)', () => {
		expect(objectDeepMerge(42, 99)).toBe(99);
		expect(objectDeepMerge('hello', 'world')).toBe('world');
		expect(objectDeepMerge(true, false)).toBe(false);
		expect(objectDeepMerge(0, 5)).toBe(5);
	});

	it('null on the right overwrites any left-hand value', () => {
		expect(objectDeepMerge({ a: 1 }, null)).toBeNull();
		expect(objectDeepMerge(42, null)).toBeNull();
	});

	it('undefined on the right overwrites any left-hand value', () => {
		expect(objectDeepMerge({ a: 1 }, undefined)).toBeUndefined();
		expect(objectDeepMerge('hello', undefined)).toBeUndefined();
	});

	// -----------------------------------------------------------------------
	// Plain objects — non-overlapping keys
	// -----------------------------------------------------------------------

	it('merges two objects with non-overlapping keys', () => {
		const a = { name: 'Alice' };
		const b = { age: 30 };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ name: 'Alice', age: 30 });
	});

	it('returns a new object (does not mutate inputs)', () => {
		const a = { x: 1 };
		const b = { y: 2 };
		const result = objectDeepMerge(a, b);
		expect(result).not.toBe(a);
		expect(result).not.toBe(b);
		expect(a).toEqual({ x: 1 });
		expect(b).toEqual({ y: 2 });
	});

	// -----------------------------------------------------------------------
	// Plain objects — overlapping keys
	// -----------------------------------------------------------------------

	it('overwrites primitive values with the right-hand value', () => {
		const result = objectDeepMerge({ a: 1, b: 'old' }, { b: 'new', c: true });
		expect(result).toEqual({ a: 1, b: 'new', c: true });
	});

	it('recursively merges nested objects', () => {
		const a = { meta: { visits: 1, score: 10 } };
		const b = { meta: { visits: 2, lastSeen: 'today' } };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ meta: { visits: 2, score: 10, lastSeen: 'today' } });
		expect(result.meta).not.toBe(a.meta);
		expect(result.meta).not.toBe(b.meta);
	});

	it('deeply nested objects (4+ levels)', () => {
		const a = { a: { b: { c: { d: 1, keep: true } } } };
		const b = { a: { b: { c: { d: 2, extra: 'new' } } } };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ a: { b: { c: { d: 2, keep: true, extra: 'new' } } } });
	});

	// -----------------------------------------------------------------------
	// Empty objects
	// -----------------------------------------------------------------------

	it('merging with an empty object returns the other object deeply cloned', () => {
		const b = { a: 1, b: { c: 2 } };
		const result = objectDeepMerge({}, b);
		expect(result).toEqual({ a: 1, b: { c: 2 } });
		expect(result).not.toBe(b);
		expect(result.b).not.toBe(b.b); // nested objects are deep-cloned
	});

	it('merging two empty objects returns an empty object', () => {
		const result = objectDeepMerge({}, {});
		expect(result).toEqual({});
	});

	it('merging empty with non-empty traverses correctly', () => {
		const result = objectDeepMerge({ a: { b: 1 } }, {});
		expect(result).toEqual({ a: { b: 1 } });
	});

	it('B-only nested objects are deep-cloned (not shared references)', () => {
		const b = { nested: { deep: true }, arr: [{ id: 1 }] };
		const result = objectDeepMerge({}, b);
		expect(result.nested).toEqual({ deep: true });
		expect(result.nested).not.toBe(b.nested);
		expect(result.arr).toEqual([{ id: 1 }]);
		expect(result.arr).not.toBe(b.arr);
		expect(result.arr[0]).not.toBe(b.arr[0]);
	});

	// -----------------------------------------------------------------------
	// Arrays — default replace strategy
	// -----------------------------------------------------------------------

	it('replaces arrays by default', () => {
		const a = { tags: ['js', 'ts'] };
		const b = { tags: ['css', 'html'] };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ tags: ['css', 'html'] });
		expect(result.tags).not.toBe(a.tags);
		expect(result.tags).not.toBe(b.tags);
	});

	it('replaces nested arrays by default', () => {
		const a = { items: [{ id: 1 }, { id: 2 }] };
		const b = { items: [{ id: 3 }] };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ items: [{ id: 3 }] });
	});

	// -----------------------------------------------------------------------
	// Arrays — concat strategy
	// -----------------------------------------------------------------------

	it('concatenates arrays when arrayMerge is concat', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const result = merge({ tags: ['js', 'ts'] }, { tags: ['css'] });
		expect(result).toEqual({ tags: ['js', 'ts', 'css'] });
	});

	it('concat creates a new array', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const a = { items: [1, 2] };
		const b = { items: [3, 4] };
		const result = merge(a, b);
		expect(result.items).not.toBe(a.items);
		expect(result.items).not.toBe(b.items);
	});

	// -----------------------------------------------------------------------
	// Special built-in types (Date, RegExp, Map, Set, Error)
	// -----------------------------------------------------------------------

	it('second Date overwrites first', () => {
		const date1 = new Date('2020-01-01');
		const date2 = new Date('2025-06-15');
		const a = { created: date1 };
		const b = { created: date2 };
		const result = objectDeepMerge(a, b);
		expect(result.created).toBeInstanceOf(Date);
		expect((result.created as Date).getTime()).toBe(date2.getTime());
	});

	it('second RegExp overwrites first', () => {
		const a = { pattern: /abc/i };
		const b = { pattern: /xyz/g };
		const result = objectDeepMerge(a, b);
		expect(result.pattern).toBeInstanceOf(RegExp);
		expect(result.pattern).toEqual(/xyz/g);
	});

	it('second Map overwrites first', () => {
		const map1 = new Map([['a', 1]]);
		const map2 = new Map([['b', 2]]);
		const result = objectDeepMerge({ data: map1 }, { data: map2 });
		expect(result.data).toBeInstanceOf(Map);
		expect(result.data).toBe(map2);
	});

	it('second Set overwrites first', () => {
		const set1 = new Set([1, 2]);
		const set2 = new Set([3, 4]);
		const result = objectDeepMerge({ items: set1 }, { items: set2 });
		expect(result.items).toBeInstanceOf(Set);
		expect(result.items).toBe(set2);
	});

	it('second Error overwrites first', () => {
		const error1 = new Error('first');
		const error2 = new Error('second');
		const result = objectDeepMerge({ err: error1 }, { err: error2 });
		expect(result.err).toBeInstanceOf(Error);
		expect(result.err).toBe(error2);
	});

	// -----------------------------------------------------------------------
	// Mixed types (object vs primitive, array vs object, etc.)
	// -----------------------------------------------------------------------

	it('when A is object and B is primitive, B wins', () => {
		const result = objectDeepMerge({ a: 1, b: 2 }, 'string');
		expect(result).toBe('string');
	});

	it('when A is array and B is object, B wins', () => {
		const result = objectDeepMerge([1, 2, 3], { key: 'value' });
		expect(result).toEqual({ key: 'value' });
	});

	it('when A is object and B is array, B wins', () => {
		const result = objectDeepMerge({ a: 1 }, [1, 2, 3]);
		expect(result as unknown).toEqual([1, 2, 3]);
	});

	it('when A is an array and B is a special object, B wins', () => {
		const date = new Date('2025-06-15');
		const map = new Map([['k', 'v']]);
		expect(objectDeepMerge([1, 2, 3], date)).toBe(date);
		expect(objectDeepMerge([1, 2, 3], map)).toBe(map);
	});

	// -----------------------------------------------------------------------
	// Multiple objects (variadic)
	// -----------------------------------------------------------------------

	it('merges three objects left-to-right', () => {
		const result = objectDeepMerge({ a: 1 }, { b: 2 }, { c: 3 });
		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	it('merges four objects with overlapping keys', () => {
		const result = objectDeepMerge(
			{ a: 1, nested: { x: 1 } },
			{ b: 2, nested: { y: 2 } },
			{ c: 3, nested: { z: 3 } },
			{ nested: { w: 4 } },
		);
		expect(result).toEqual({
			a: 1,
			b: 2,
			c: 3,
			nested: { x: 1, y: 2, z: 3, w: 4 },
		});
	});

	it('merges five objects', () => {
		const result = objectDeepMerge({ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 });
		expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
	});

	// -----------------------------------------------------------------------
	// withOptions builder
	// -----------------------------------------------------------------------

	it('withOptions returns a pre-configured merge function', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
	});

	it('withOptions supports maxDepth', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 1 });
		const a = { outer: { inner: { a: 1, b: 2 } } };
		const b = { outer: { inner: { b: 99, c: 3 } } };
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		expect(merge(a, b) as unknown).toEqual({ outer: { inner: { b: 99, c: 3 } } });
	});

	it('withOptions can be reused across multiple calls', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		expect(merge({ x: [1] }, { x: [2] })).toEqual({ x: [1, 2] });
		expect(merge({ y: [3] }, { y: [4] })).toEqual({ y: [3, 4] });
	});

	it('withOptions with empty options behaves like default', () => {
		const merge = objectDeepMerge.withOptions({});
		expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
		expect(merge({ tags: ['js'] }, { tags: ['ts'] })).toEqual({ tags: ['ts'] });
	});

	// -----------------------------------------------------------------------
	// maxDepth
	// -----------------------------------------------------------------------

	it('stops recursing beyond maxDepth (shallow merge)', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 0 });
		const a = { level1: { level2: { level3: { deep: 'a' } } } };
		const b = { level1: { level2: { level3: { deep: 'b', extra: 'x' } } } };
		// maxDepth 0 means no recursion at all — B returned entirely (A discarded)
		expect(merge(a, b)).toEqual({ level1: { level2: { level3: { deep: 'b', extra: 'x' } } } });
	});

	// -----------------------------------------------------------------------
	// Circular references
	// -----------------------------------------------------------------------

	it('handles self-referencing objects', () => {
		const a: any = { name: 'a' };
		a.self = a;

		const b: any = { name: 'b' };
		const result = objectDeepMerge(a, b);
		expect(result.name).toBe('b');
		// a.self was circular, b doesn't have self, so self comes from a
		expect(result.self).toBeDefined();
	});

	it('handles mutual circular references', () => {
		const a: any = { name: 'a' };
		const b: any = { name: 'b' };
		a.child = b;
		b.parent = a;

		const c = { extra: true };
		const result = objectDeepMerge(a, c) as any;
		expect(result.name).toBe('a');
		expect(result.extra).toBe(true);
	});

	// -----------------------------------------------------------------------
	// Falsy values
	// -----------------------------------------------------------------------

	it('preserves false, 0, empty string, NaN', () => {
		const a = { flag: true, count: 10, label: 'hello', score: 100 };
		const b = { flag: false, count: 0, label: '', score: Number.NaN };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ flag: false, count: 0, label: '', score: Number.NaN });
	});

	// -----------------------------------------------------------------------
	// Zero arguments / single argument
	// -----------------------------------------------------------------------

	it('returns an empty object when called with no arguments', () => {
		const result = (objectDeepMerge as any)();
		expect(result).toEqual({});
	});

	it('returns a deep clone when called with a single object', () => {
		const obj = { a: 1, b: { c: 2 } };
		const result = (objectDeepMerge as any)(obj);
		expect(result).toEqual(obj);
		expect(result).not.toBe(obj);
		expect(result.b).not.toBe(obj.b);
	});

	it('single argument with non-cloneable value throws from structuredClone', () => {
		const fn = () => 'hello';
		expect(() => (objectDeepMerge as any)(fn)).toThrow();
	});

	// -----------------------------------------------------------------------
	// Immutability — inputs never mutated
	// -----------------------------------------------------------------------

	it('does not mutate the first argument', () => {
		const a = { x: { y: 1 } };
		const b = { x: { z: 2 } };
		const aClone = structuredClone(a);
		objectDeepMerge(a, b);
		expect(a).toEqual(aClone);
	});

	it('does not mutate the second argument', () => {
		const a = { x: { y: 1 } };
		const b = { x: { z: 2 } };
		const bClone = structuredClone(b);
		objectDeepMerge(a, b);
		expect(b).toEqual(bClone);
	});

	// -----------------------------------------------------------------------
	// Symbol keys (ignored — only string keys are merged)
	// -----------------------------------------------------------------------

	it('ignores symbol-keyed properties', () => {
		const symbol = Symbol('test');
		const a = { [symbol]: 'secret', name: 'a' };
		const b = { name: 'b' };
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		const result = objectDeepMerge(a, b) as Record<string, unknown>;
		expect(result).toEqual({ name: 'b' });
		expect(result[symbol as unknown as string]).toBeUndefined();
	});

	// -----------------------------------------------------------------------
	// Array concat with objects
	// -----------------------------------------------------------------------

	it('concatenates arrays of objects', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const a = { items: [{ id: 1, name: 'a' }] };
		const b = { items: [{ id: 2, name: 'b' }] };
		const result = merge(a, b);
		expect(result).toEqual({ items: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }] });
	});

	// -----------------------------------------------------------------------
	// withOptions: zero or single arg
	// -----------------------------------------------------------------------

	it('withOptions returns empty object when called with no arguments', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		expect((merge as any)()).toEqual({});
	});

	it('withOptions single argument returns a deep clone', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const obj = { a: 1, b: { c: 2 } };
		const result = merge(obj);
		expect(result).toEqual(obj);
		expect(result).not.toBe(obj);
		expect((result as any).b).not.toBe(obj.b);
	});

	it('withOptions with three arguments works correctly', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'replace' });
		const result = merge({ a: 1 }, { b: 2 }, { c: 3 });
		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	it('withOptions with combined maxDepth and arrayMerge', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 1, arrayMerge: 'concat' });
		const a = { items: [1, 2], nested: { a: 1, b: 2 } };
		const b = { items: [3], nested: { b: 99, c: 3 } };
		const result = merge(a, b) as any;
		// maxDepth=1: arrays at depth 1 are NOT merged (depth check fires first).
		// B's array replaces A's entirely. Objects at depth 1 are also not merged.
		expect(result.items).toEqual([3]);
		expect(result.nested).toEqual({ b: 99, c: 3 });
	});

	// -----------------------------------------------------------------------
	// Additional special built-in types (WeakMap, WeakSet, ArrayBuffer,
	// TypedArrays, DataView, TypeError)
	// -----------------------------------------------------------------------

	it('second WeakMap overwrites first', () => {
		const wm1 = new WeakMap();
		const key1 = {};
		wm1.set(key1, 'a');
		const wm2 = new WeakMap();
		const key2 = {};
		wm2.set(key2, 'b');
		const result = objectDeepMerge({ data: wm1 }, { data: wm2 });
		expect(result.data).toBeInstanceOf(WeakMap);
		expect(result.data).toBe(wm2);
	});

	it('second WeakSet overwrites first', () => {
		const ws1 = new WeakSet();
		ws1.add({});
		const ws2 = new WeakSet();
		ws2.add({});
		const result = objectDeepMerge({ data: ws1 }, { data: ws2 });
		expect(result.data).toBeInstanceOf(WeakSet);
		expect(result.data).toBe(ws2);
	});

	it('second ArrayBuffer overwrites first', () => {
		const buf1 = new ArrayBuffer(8);
		const buf2 = new ArrayBuffer(16);
		const result = objectDeepMerge({ buffer: buf1 }, { buffer: buf2 });
		expect(result.buffer).toBeInstanceOf(ArrayBuffer);
		expect(result.buffer).toBe(buf2);
		expect((result.buffer as ArrayBuffer).byteLength).toBe(16);
	});

	it('second Uint8Array (TypedArray) overwrites first', () => {
		const arr1 = new Uint8Array([1, 2, 3]);
		const arr2 = new Uint8Array([4, 5]);
		const result = objectDeepMerge({ data: arr1 }, { data: arr2 });
		expect(result.data).toBeInstanceOf(Uint8Array);
		expect(result.data).toBe(arr2);
	});

	it('second Int32Array (TypedArray) overwrites first', () => {
		const arr1 = new Int32Array([10, 20]);
		const arr2 = new Int32Array([30]);
		const result = objectDeepMerge({ data: arr1 }, { data: arr2 });
		expect(result.data).toBeInstanceOf(Int32Array);
		expect(result.data).toBe(arr2);
	});

	it('second Float64Array (TypedArray) overwrites first', () => {
		const arr1 = new Float64Array([1.1, 2.2]);
		const arr2 = new Float64Array([3.3]);
		const result = objectDeepMerge({ data: arr1 }, { data: arr2 });
		expect(result.data).toBeInstanceOf(Float64Array);
		expect(result.data).toBe(arr2);
	});

	it('second DataView overwrites first', () => {
		const buf1 = new ArrayBuffer(8);
		const view1 = new DataView(buf1);
		const buf2 = new ArrayBuffer(16);
		const view2 = new DataView(buf2);
		const result = objectDeepMerge({ view: view1 }, { view: view2 });
		expect(result.view).toBeInstanceOf(DataView);
		expect(result.view).toBe(view2);
	});

	it('second TypeError (Error subclass) overwrites first', () => {
		const err1 = new TypeError('first');
		const err2 = new TypeError('second');
		const result = objectDeepMerge({ err: err1 }, { err: err2 });
		expect(result.err).toBeInstanceOf(TypeError);
		expect(result.err).toBe(err2);
	});

	it('all Error subclasses are treated as special objects', () => {
		const errors: Array<[string, Error]> = [
			['Error', new Error('x')],
			['TypeError', new TypeError('x')],
			['RangeError', new RangeError('x')],
			['SyntaxError', new SyntaxError('x')],
			['ReferenceError', new ReferenceError('x')],
			['URIError', new URIError('x')],
		];
		for (const [, err] of errors) {
			const result = objectDeepMerge({ err: 'old' }, { err }) as any;
			expect(result.err).toBe(err);
		}
	});

	it('special object on left, plain object on right — right wins', () => {
		const date = new Date('2020-01-01');
		const result = objectDeepMerge({ created: date }, { created: { year: 2025 } });
		expect((result as any).created).toEqual({ year: 2025 });
	});

	it('plain object on left, special object on right — right wins', () => {
		const date = new Date('2025-06-15');
		const result = objectDeepMerge({ created: { year: 2020 } }, { created: date });
		expect((result as any).created).toBeInstanceOf(Date);
		expect((result as any).created).toBe(date);
	});

	it('both sides are different special objects — right wins', () => {
		const date = new Date('2020-01-01');
		const regexp = /test/g;
		const result = objectDeepMerge({ value: date }, { value: regexp });
		expect((result as any).value).toBeInstanceOf(RegExp);
		expect((result as any).value).toBe(regexp);
	});

	it('same special object on both sides returns the same reference (B wins)', () => {
		const date = new Date('2025-06-15');
		const regexp = /test/g;
		const map = new Map([['k', 'v']]);
		expect(objectDeepMerge({ value: date }, { value: date })).toEqual({ value: date });
		expect((objectDeepMerge({ value: date }, { value: date }) as any).value).toBe(date);
		expect((objectDeepMerge({ value: regexp }, { value: regexp }) as any).value).toBe(regexp);
		expect((objectDeepMerge({ value: map }, { value: map }) as any).value).toBe(map);
	});

	// -----------------------------------------------------------------------
	// Promise (not a special object — merged as plain object)
	// -----------------------------------------------------------------------

	it('Promise is treated as a plain object (own properties merged)', () => {
		// A Promise is not in the isSpecialObject list, so its enumerable own
		// properties are merged like any other plain object.
		const a = { data: Promise.resolve(1) as any };
		const b = { data: { extra: true } };
		const result = objectDeepMerge(a, b) as any;
		expect(result.data.extra).toBe(true);
	});

	// -----------------------------------------------------------------------
	// Functions as values
	// -----------------------------------------------------------------------

	it('function on the right overwrites function on the left', () => {
		const fn1 = () => 'a';
		const fn2 = () => 'b';
		const result = objectDeepMerge({ handler: fn1 }, { handler: fn2 }) as {
			handler: () => string;
		};
		expect(result.handler).toBe(fn2);
	});

	it('function on the right overwrites primitive on the left', () => {
		const fn = () => 'hello';
		const result = objectDeepMerge({ handler: 'old' }, { handler: fn }) as {
			handler: () => string;
		};
		expect(result.handler).toBe(fn);
	});

	it('function on the right overwrites object on the left', () => {
		const fn = () => 'hello';
		const result = objectDeepMerge({ handler: { nested: true } }, { handler: fn }) as any;
		expect(result.handler).toBe(fn);
	});

	// -----------------------------------------------------------------------
	// BigInt values
	// -----------------------------------------------------------------------

	it('BigInt on the right overwrites BigInt on the left', () => {
		const result = objectDeepMerge({ value: 1n }, { value: 2n });
		expect(result).toEqual({ value: 2n });
	});

	it('BigInt on the right overwrites number on the left', () => {
		const result = objectDeepMerge({ value: 42 }, { value: 99n });
		expect(result).toEqual({ value: 99n });
	});

	// -----------------------------------------------------------------------
	// Symbol as primitive values (not keys)
	// -----------------------------------------------------------------------

	it('Symbol as a value is treated as a primitive (B wins)', () => {
		const sym1 = Symbol('a');
		const sym2 = Symbol('b');
		const result = objectDeepMerge({ key: sym1 }, { key: sym2 });
		expect(result).toEqual({ key: sym2 });
	});

	// -----------------------------------------------------------------------
	// Object.create(null) — null-prototype objects
	// -----------------------------------------------------------------------

	it('merges null-prototype objects correctly', () => {
		const a = Object.assign(Object.create(null), { name: 'Alice' });
		const b = Object.assign(Object.create(null), { age: 30 });
		const result = objectDeepMerge(a, b) as any;
		expect(result.name).toBe('Alice');
		expect(result.age).toBe(30);
		// eslint-disable-next-line no-prototype-builtins
		expect(Object.prototype.hasOwnProperty.call(result, 'name')).toBe(true);
	});

	it('B as null-prototype object merges correctly', () => {
		const a = { name: 'Alice' };
		const b = Object.assign(Object.create(null), { age: 30, nested: { deep: true } });
		const result = objectDeepMerge(a, b) as any;
		expect(result.name).toBe('Alice');
		expect(result.age).toBe(30);
		expect(result.nested).toEqual({ deep: true });
		expect(result.nested).not.toBe((b as any).nested);
	});

	// -----------------------------------------------------------------------
	// Array edge cases
	// -----------------------------------------------------------------------

	it('replace: empty array on right replaces non-empty array', () => {
		const result = objectDeepMerge({ items: [1, 2, 3] }, { items: [] });
		expect(result).toEqual({ items: [] });
	});

	it('replace: deep-clones nested objects in array elements', () => {
		const b = { items: [{ id: 2, meta: { y: 2, deeper: { z: 3 } } }] };
		const result = objectDeepMerge({ items: [] }, b) as any;
		expect(result).toEqual({ items: [{ id: 2, meta: { y: 2, deeper: { z: 3 } } }] });
		expect(result.items[0]).not.toBe(b.items[0]);
		expect(result.items[0].meta).not.toBe(b.items[0].meta);
		expect(result.items[0].meta.deeper).not.toBe(b.items[0].meta.deeper);
	});

	it('concat: empty array A, non-empty B', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const result = merge({ items: [] }, { items: [1, 2] }) as any;
		expect(result).toEqual({ items: [1, 2] });
	});

	it('concat: non-empty array A, empty B', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const result = merge({ items: [1, 2] }, { items: [] }) as any;
		expect(result).toEqual({ items: [1, 2] });
	});

	it('concat: both empty arrays', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const result = merge({ items: [] }, { items: [] });
		expect(result).toEqual({ items: [] });
	});

	it('concat: deep-clones elements from both arrays', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const a = { items: [{ id: 1, meta: { x: 1 } }] };
		const b = { items: [{ id: 2, meta: { y: 2 } }] };
		const result = merge(a, b) as any;
		expect(result).toEqual({
			items: [
				{ id: 1, meta: { x: 1 } },
				{ id: 2, meta: { y: 2 } },
			],
		});
		expect(result.items[0]).not.toBe(a.items[0]);
		expect(result.items[1]).not.toBe(b.items[0]);
		expect(result.items[0].meta).not.toBe(a.items[0].meta);
	});

	it('handles sparse arrays (undefined holes)', () => {
		// eslint-disable-next-line no-sparse-arrays
		const a = { items: [1, , 3] };
		const b = { items: [4, 5] };
		const result = objectDeepMerge(a, b);
		expect(result).toEqual({ items: [4, 5] });
	});

	it('array with circular self-reference does not infinite-loop', () => {
		const a: any[] = [1, 2];
		a.push(a);
		const objA = { arr: a };
		const objB = { arr: [3, 4] };
		const result = objectDeepMerge(objA, objB);
		expect(Array.isArray(result.arr)).toBe(true);
		expect(result.arr).toEqual([3, 4]);
	});

	it('concat: circular self-referencing array does not infinite-loop', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const a: any[] = [1, 2];
		a.push(a); // a = [1, 2, a]
		const objA = { arr: a };
		const objB = { arr: [3] };
		const result = merge(objA, objB) as any;
		expect(Array.isArray(result.arr)).toBe(true);
		expect(result.arr).toHaveLength(4); // 1, 2, [1,2,<circular>], 3
		expect(result.arr[0]).toBe(1);
		expect(result.arr[1]).toBe(2);
		expect(result.arr[3]).toBe(3);
		// The cloned circular sub-array preserves the cycle.
		expect(Array.isArray(result.arr[2])).toBe(true);
		expect((result.arr[2] as any[])[2]).toBe(result.arr[2]);
	});

	// -----------------------------------------------------------------------
	// maxDepth boundary cases
	// -----------------------------------------------------------------------

	it('maxDepth 1 merges one level but not deeper', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 1 });
		const a = { level1: { level2: { a: 1, b: 2 } } };
		const b = { level1: { level2: { b: 99, c: 3 } } };
		const result = merge(a, b) as any;
		// depth 0: root. depth 1: level1. depth 2: level2 (blocked by maxDepth=1).
		// So level2 from B overwrites level2 from A entirely.
		expect(result).toEqual({ level1: { level2: { b: 99, c: 3 } } });
	});

	it('maxDepth 2 allows two levels of merging (depth 0 and 1 merged, depth 2+ overwritten)', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 2 });
		const a = { level1: { level2: { a: 1, b: 2, level3: { deep: 'a' } } } };
		const b = { level1: { level2: { b: 99, c: 3, level3: { deep: 'b', extra: 'x' } } } };
		const result = merge(a, b) as any;
		// depth 0: root (merged). depth 1: level1 (merged).
		// depth 2: level2 — maxDepth reached, B's level2 overwrites entirely.
		expect(result).toEqual({
			level1: {
				level2: {
					b: 99,
					c: 3,
					level3: { deep: 'b', extra: 'x' },
				},
			},
		});
	});

	it('maxDepth applies within arrays too', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 1 });
		const a = { items: [{ nested: { a: 1, b: 2 } }] };
		const b = { items: [{ nested: { b: 99, c: 3 } }] };
		const result = merge(a, b) as any;
		// depth 0: root. depth 1: the element inside items.
		// maxDepth=1 blocks further recursion; B's element is returned as-is.
		expect(result).toEqual({ items: [{ nested: { b: 99, c: 3 } }] });
	});

	it('maxDepth default (50) handles deep structures without overflow', () => {
		// Build a deeply nested object (> 20 levels).
		let deepA: any = { value: 'a' };
		let deepB: any = { value: 'b', extra: 'x' };
		for (let i = 0; i < 25; i++) {
			deepA = { nested: deepA };
			deepB = { nested: deepB };
		}

		const result = objectDeepMerge(deepA, deepB) as any;
		// Walk down to the leaf.
		let node: any = result;
		for (let i = 0; i < 25; i++) {
			expect(node).toHaveProperty('nested');
			node = node.nested;
		}

		expect(node).toEqual({ value: 'b', extra: 'x' });
	});

	// -----------------------------------------------------------------------
	// Class instances (non-special objects)
	// -----------------------------------------------------------------------

	it('class instances are treated as plain objects (own properties merged)', () => {
		class User {
			constructor(
				public name: string,
				public age: number,
			) {}
		}

		const a = { user: new User('Alice', 30) };
		const b = { user: { age: 31 } as any };
		const result = objectDeepMerge(a, b) as any;
		expect(result.user.name).toBe('Alice');
		expect(result.user.age).toBe(31);
	});

	it('non-special class instance on right is unwrapped — merged as plain object', () => {
		class User {
			constructor(
				public name: string,
				public age: number,
			) {}
		}

		const user = new User('Bob', 25);
		const result = objectDeepMerge({ user: { name: 'Alice', age: 30 } }, { user }) as any;
		// User is not a special object, so it is treated as a plain object.
		// Its own properties are merged into a new plain object — the class
		// prototype is lost.
		expect(result.user).not.toBeInstanceOf(User);
		expect(result.user).toEqual({ name: 'Bob', age: 25 });
		expect(Object.getPrototypeOf(result.user)).toBe(Object.prototype);
	});

	// -----------------------------------------------------------------------
	// A-only keys (not present in B) — reference preservation
	// -----------------------------------------------------------------------

	it('A-only plain object keys are preserved by reference (not deep-cloned)', () => {
		const nested = { deep: true };
		const a = { nested, name: 'a' };
		const b = { name: 'b' };
		const result = objectDeepMerge(a, b) as any;
		expect(result.name).toBe('b');
		expect(result.nested).toBe(nested); // Same reference!
	});

	it('A-only array keys are preserved by reference (not deep-cloned)', () => {
		const arr = [1, 2, 3];
		const a = { items: arr, name: 'a' };
		const b = { name: 'b' };
		const result = objectDeepMerge(a, b) as any;
		expect(result.items).toBe(arr); // Same reference!
	});

	it('A-only special object keys are preserved by reference', () => {
		const specials = [
			new Date('2020-01-01'),
			/pattern/,
			new Map([['k', 'v']]),
			new Set([1]),
		];
		for (const special of specials) {
			const a = { value: special, name: 'a' };
			const b = { name: 'b' };
			const result = objectDeepMerge(a, b) as any;
			expect(result.value).toBe(special);
		}
	});

	// -----------------------------------------------------------------------
	// Undefined handling edge cases
	// -----------------------------------------------------------------------

	it('explicit undefined in B overwrites object in A', () => {
		const result = objectDeepMerge({ key: { nested: true } }, { key: undefined });
		expect(result).toEqual({ key: undefined });
	});

	it('explicit undefined in B overwrites array in A', () => {
		const result = objectDeepMerge({ key: [1, 2, 3] }, { key: undefined });
		expect(result).toEqual({ key: undefined });
	});

	// -----------------------------------------------------------------------
	// Multiple arrays at different nesting levels
	// -----------------------------------------------------------------------

	it('handles arrays at different nesting levels independently', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const a = { top: [1], nested: { inner: ['a'] } };
		const b = { top: [2], nested: { inner: ['b'] } };
		const result = merge(a, b);
		expect(result).toEqual({ top: [1, 2], nested: { inner: ['a', 'b'] } });
	});

	// -----------------------------------------------------------------------
	// Full immutability — no input references leak into result
	// -----------------------------------------------------------------------

	it('nested objects in result have no reference to input objects', () => {
		const a = { outer: { inner: { value: 1 } } };
		const b = { outer: { inner: { extra: 2 } } };
		const result = objectDeepMerge(a, b) as any;
		expect(result.outer).not.toBe(a.outer);
		expect(result.outer).not.toBe(b.outer);
		expect(result.outer.inner).not.toBe(a.outer.inner);
		expect(result.outer.inner).not.toBe(b.outer.inner);
	});

	// -----------------------------------------------------------------------
	// Stress: large number of arguments
	// -----------------------------------------------------------------------

	it('merges ten objects left-to-right', () => {
		const objects = Array.from({ length: 10 }, (_, i) => ({ [String(i)]: i }));
		const result = (objectDeepMerge as any)(...objects);
		const expected = Object.fromEntries(
			Array.from({ length: 10 }, (_, i) => [String(i), i]),
		);
		expect(result).toEqual(expected);
	});

	// -----------------------------------------------------------------------
	// Prototype chain properties (should be ignored)
	// -----------------------------------------------------------------------

	it('ignores inherited prototype properties', () => {
		const proto = { inherited: 'should be ignored' };
		const a = Object.create(proto);
		(a as any).ownA = 'valueA';
		const b = { ownB: 'valueB' };
		const result = objectDeepMerge(a, b) as any;
		expect(result.ownA).toBe('valueA');
		expect(result.ownB).toBe('valueB');
		expect(result.inherited).toBeUndefined();
	});

	it('ignores non-enumerable own properties on source objects', () => {
		const a = { visibleA: 'a' };
		Object.defineProperty(a, 'hiddenA', { value: 'secret-a', enumerable: false });
		const b = { visibleB: 'b' };
		Object.defineProperty(b, 'hiddenB', { value: 'secret-b', enumerable: false });
		const result = objectDeepMerge(a, b) as Record<string, unknown>;
		expect(result.visibleA).toBe('a');
		expect(result.visibleB).toBe('b');
		expect(result.hiddenA).toBeUndefined();
		expect(result.hiddenB).toBeUndefined();
		expect(Object.keys(result)).toHaveLength(2);
	});

	it('invokes getters on source objects (uses return value for merge)', () => {
		let called = false;
		const a = {
			get computed() {
				called = true;
				return 42;
			},
		};
		const b = { computed: 99 };
		const result = objectDeepMerge(a, b) as any;
		expect(called).toBe(true); // getter is invoked to read the value
		expect(result.computed).toBe(99); // B wins
	});

	// -----------------------------------------------------------------------
	// A is primitive / null / function, B is object (second if branch)
	// -----------------------------------------------------------------------

	it('when A is a primitive and B is an object, B wins', () => {
		expect(objectDeepMerge(42, { value: 100 })).toEqual({ value: 100 });
		expect(objectDeepMerge('hello', { key: 'world' })).toEqual({ key: 'world' });
		expect(objectDeepMerge(true, { flag: false })).toEqual({ flag: false });
	});

	it('when A is null and B is an object, B wins', () => {
		expect(objectDeepMerge(null, { a: 1 })).toEqual({ a: 1 });
	});

	it('when A is undefined and B is an object, B wins', () => {
		expect(objectDeepMerge(undefined, { a: 1 })).toEqual({ a: 1 });
	});

	it('when A is a function and B is a plain object, B wins', () => {
		const fn = () => 'hello';
		const result = objectDeepMerge(fn, { key: 'value' });
		expect(result).toEqual({ key: 'value' });
	});

	it('when A is a primitive and B is a special object, B wins', () => {
		const date = new Date('2025-06-15');
		const regexp = /test/g;
		const map = new Map([['k', 'v']]);
		expect(objectDeepMerge(42, date)).toBe(date);
		expect(objectDeepMerge('hello', regexp)).toBe(regexp);
		expect(objectDeepMerge(true, map)).toBe(map);
	});

	it('when A is null and B is a special object, B wins', () => {
		const date = new Date('2025-06-15');
		expect(objectDeepMerge(null, date)).toBe(date);
	});

	it('when A is undefined and B is a special object, B wins', () => {
		const map = new Map([['k', 'v']]);
		expect(objectDeepMerge(undefined, map)).toBe(map);
	});

	// -----------------------------------------------------------------------
	// Same reference appears in both A and B (shared substructure)
	// -----------------------------------------------------------------------

	it('shared reference in both A and B is handled correctly', () => {
		const shared = { x: 1 };
		const a = { foo: shared, name: 'a' };
		const b = { bar: shared, name: 'b' };
		const result = objectDeepMerge(a, b) as any;
		expect(result.name).toBe('b');
		expect(result.foo).toBe(shared); // A-only key, same reference
		expect(result.bar).toEqual(shared); // deep-cloned copy
		expect(result.bar).not.toBe(shared);
	});

	it('shared reference appearing as B in two different merge paths is independently merged', () => {
		// Each occurrence of the same B-reference is merged against its own
		// A-value.  There is no cross-key sharing — each path produces an
		// independent result.  This prevents data leaks when A-values differ
		// (see the next test).
		const shared = { nested: { value: 1 } };
		const a = { first: {}, second: {} };
		const b = { first: shared, second: shared };
		const result = objectDeepMerge(a, b) as any;
		expect(result.first).toEqual({ nested: { value: 1 } });
		expect(result.second).toEqual({ nested: { value: 1 } });
		expect(result.first).not.toBe(shared);
		expect(result.second).not.toBe(shared);
	});

	it('shared B-reference with DIFFERING A-values does not leak data between paths', () => {
		// Regression test: the visited map must NOT cache merge results across
		// different merge paths.  When the same object appears in B at two
		// different keys, each merge must be independent — A-values from one
		// path must never leak into the other.
		const shared = { x: 1 };
		const a = { first: { y: 2 }, second: {} };
		const b = { first: shared, second: shared };
		const result = objectDeepMerge(a, b) as any;
		expect(result.first).toEqual({ x: 1, y: 2 });
		expect(result.second).toEqual({ x: 1 });
		// The critical assertion: 'second' must NOT contain 'y' from 'first'.
		expect(result.second).not.toHaveProperty('y');
	});

	it('shared B-reference with three differing A-values all independent', () => {
		const shared = { x: 1 };
		const a = { first: { a: 1 }, second: { b: 2 }, third: { c: 3 } };
		const b = { first: shared, second: shared, third: shared };
		const result = objectDeepMerge(a, b) as any;
		expect(result.first).toEqual({ x: 1, a: 1 });
		expect(result.second).toEqual({ x: 1, b: 2 });
		expect(result.third).toEqual({ x: 1, c: 3 });
		expect(result.first).not.toHaveProperty('b');
		expect(result.first).not.toHaveProperty('c');
	});

	// -----------------------------------------------------------------------
	// Both A and B are the same object reference (identity merge)
	// -----------------------------------------------------------------------

	it('merging an object with itself returns a deep clone', () => {
		const obj = { a: 1, b: { c: 2 } };
		const result = objectDeepMerge(obj, obj);
		expect(result).toEqual(obj);
		expect(result).not.toBe(obj);
		expect(result.b).not.toBe(obj.b);
	});

	it('merging an array with itself returns a deep clone', () => {
		const arr = [1, { x: 2 }, [3]];
		const result = objectDeepMerge(arr, arr);
		expect(result).toEqual(arr);
		expect(result).not.toBe(arr);
		expect(result[1]).not.toBe(arr[1]);
		expect(result[2]).not.toBe(arr[2]);
	});

	// -----------------------------------------------------------------------
	// Array concat with circular reference in elements
	// -----------------------------------------------------------------------

	it('concat handles array elements with circular references', () => {
		const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
		const inner: any = { name: 'inner' };
		inner.self = inner; // circular
		const a = { items: [inner] };
		const b = { items: [{ name: 'other' }] };
		const result = merge(a, b) as any;
		expect(result.items).toHaveLength(2);
		expect(result.items[0].name).toBe('inner');
		expect(result.items[0].self).toBe(result.items[0]); // circular preserved
		expect(result.items[1].name).toBe('other');
	});

	// -----------------------------------------------------------------------
	// maxDepth: verifying reference behavior at depth boundary
	// -----------------------------------------------------------------------

	it('maxDepth exceeded returns B value as-is (same reference)', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 0 });
		const nested = { deep: true };
		const a = { data: { old: true } };
		const b = { data: nested };
		const result = merge(a, b) as any;
		expect(result.data).toBe(nested); // Same reference — B's value returned directly
	});

	// -----------------------------------------------------------------------
	// maxDepth with arrays at root level
	// -----------------------------------------------------------------------

	it('maxDepth 0 with root-level arrays returns B as-is (replace)', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 0 });
		expect(merge([1, 2], [3, 4])).toEqual([3, 4]);
	});

	it('maxDepth 0 with root-level arrays returns B as-is (concat)', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 0, arrayMerge: 'concat' });
		expect(merge([1, 2], [3, 4])).toEqual([3, 4]);
	});

	it('maxDepth 1 with root-level arrays concat clones primitives', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 1, arrayMerge: 'concat' });
		expect(merge([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
	});

	it('maxDepth 1 with root-level arrays concat clones elements (blocked at depth 1)', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 1, arrayMerge: 'concat' });
		const nestedA = { x: 1 };
		const nestedB = { y: 2 };
		// depth 0: array → concat. depth 1 (elements): maxDepth reached, returned as-is.
		const result = merge([nestedA], [nestedB]) as any;
		expect(result).toEqual([{ x: 1 }, { y: 2 }]);
		expect(result[0]).toBe(nestedA); // same reference — element returned as-is
		expect(result[1]).toBe(nestedB);
	});

	// -----------------------------------------------------------------------
	// All nine special object types in isSpecialObject verified
	// -----------------------------------------------------------------------

	it('all isSpecialObject types are recognized (summary check)', () => {
		// Date, RegExp, Error, Map, Set, WeakMap, WeakSet, ArrayBuffer,
		// SharedArrayBuffer, TypedArray (via ArrayBuffer.isView)
		const specials: Record<string, unknown> = {
			date: new Date(),
			regexp: /test/,
			error: new Error('x'),
			map: new Map(),
			set: new Set(),
			weakmap: new WeakMap(),
			weakset: new WeakSet(),
			arraybuffer: new ArrayBuffer(4),
			typedarray: new Uint8Array([1]),
		};

		// SharedArrayBuffer may not exist in all runtimes (it is available in
		// Node ≥ 16, Bun ≥ 1.0).  Include it when present.
		if (typeof SharedArrayBuffer !== 'undefined') {
			specials.sharedarraybuffer = new SharedArrayBuffer(8);
		}

		for (const [key, special] of Object.entries(specials)) {
			const result = objectDeepMerge({ [key]: 'old' }, { [key]: special }) as any;
			expect(result[key]).toBe(special);
		}
	});

	// -------------------------------------------------------------------
	// SharedArrayBuffer (dedicated test)
	// -------------------------------------------------------------------

	it('SharedArrayBuffer is treated as an atomic special object', () => {
		if (typeof SharedArrayBuffer === 'undefined') {
			return; // Skip in runtimes without SharedArrayBuffer.
		}

		const sab1 = new SharedArrayBuffer(8);
		const sab2 = new SharedArrayBuffer(16);

		// B overwrites A.
		const result = objectDeepMerge({ buffer: sab1 }, { buffer: sab2 });
		expect(result.buffer).toBeInstanceOf(SharedArrayBuffer);
		expect(result.buffer).toBe(sab2);
		expect((result.buffer as SharedArrayBuffer).byteLength).toBe(16);

		// A-only SharedArrayBuffer is preserved by reference.
		const aOnly = objectDeepMerge({ buffer: sab1 }, {});
		expect(aOnly.buffer).toBe(sab1);

		// SharedArrayBuffer on left, plain object on right — right wins.
		const mixed = objectDeepMerge({ buffer: sab1 }, { buffer: { plain: true } });
		expect((mixed as any).buffer).toEqual({ plain: true });

		// Plain object on left, SharedArrayBuffer on right — right wins.
		const mixed2 = objectDeepMerge({ buffer: { plain: true } }, { buffer: sab2 });
		expect((mixed2 as any).buffer).toBe(sab2);
	});

	// -------------------------------------------------------------------
	// Reverse immutability: mutating result must not affect inputs
	// -------------------------------------------------------------------

	it('mutating the result does not affect the first input', () => {
		const a = { nested: { value: 1 }, arr: [1, 2] };
		const b = { nested: { extra: 2 }, arr: [3] };
		const aClone = structuredClone(a);
		const result = objectDeepMerge(a, b) as any;

		// Mutate the result deeply.
		result.nested.value = 999;
		result.nested.extra = 888;
		(result.arr as any[]).push(777);
		result.newKey = 'added';

		// Original inputs must be unchanged.
		expect(a).toEqual(aClone);
		expect(b).toEqual({ nested: { extra: 2 }, arr: [3] });
	});

	it('mutating the result does not affect the second input', () => {
		const a = { x: 1 };
		const b = { nested: { deep: true }, items: [{ id: 1 }] };
		const bClone = structuredClone(b);
		const result = objectDeepMerge(a, b) as any;

		// Mutate the result deeply.
		result.nested.deep = false;
		(result.items as any[])[0].id = 999;

		// Original inputs must be unchanged.
		expect(a).toEqual({ x: 1 });
		expect(b).toEqual(bClone);
	});

	// -------------------------------------------------------------------
	// maxDepth + arrayMerge: 'concat' for nested arrays
	// -------------------------------------------------------------------

	it('maxDepth 4 + concat works for arrays nested inside objects', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 4, arrayMerge: 'concat' });
		const a = { outer: { inner: [1, 2], keep: true } };
		const b = { outer: { inner: [3, 4], extra: 'new' } };
		const result = merge(a, b) as any;
		expect(result.outer.inner).toEqual([1, 2, 3, 4]);
		expect(result.outer.keep).toBe(true);
		expect(result.outer.extra).toBe('new');
	});

	it('maxDepth 4 + concat deeply nested arrays inside objects', () => {
		const merge = objectDeepMerge.withOptions({ maxDepth: 4, arrayMerge: 'concat' });
		const a = { l1: { l2: { items: ['a'], flag: true } } };
		const b = { l1: { l2: { items: ['b'], flag: false } } };
		const result = merge(a, b) as any;
		expect(result.l1.l2.items).toEqual(['a', 'b']);
		expect(result.l1.l2.flag).toBe(false);
	});

	// -------------------------------------------------------------------
	// Stress: many keys
	// -------------------------------------------------------------------

	it('handles objects with a large number of keys', () => {
		const a: Record<string, number> = {};
		const b: Record<string, number> = {};
		for (let i = 0; i < 1_000; i++) {
			a[`key${i}`] = i;
			b[`key${i * 2}`] = i * 100; // Overlap every other key.
		}
		const result = objectDeepMerge(a, b) as Record<string, number>;
		expect(Object.keys(result)).toHaveLength(1_500);
		// key0: A=0, B=0 (0*100) → B wins with 0.
		expect(result.key0).toBe(0);
		// key1: A=1, B absent → A-only, preserved.
		expect(result.key1).toBe(1);
		// key2: A=2, B=100 (1*100) → B wins with 100.
		expect(result.key2).toBe(100);
		// key4: A=4, B=200 (2*100) → B wins with 200.
		expect(result.key4).toBe(200);
		// key999: A=999, B absent → A-only, preserved.
		expect(result.key999).toBe(999);
		// key1000: A absent, B=50000 (500*100) → B-only.
		expect(result.key1000).toBe(50_000);
	});
});
