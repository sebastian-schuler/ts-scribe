import { describe, expect, it } from 'bun:test';
import { objectDeepClone } from '../../src/object/index.js';

describe('objectDeepClone', () => {
	// -----------------------------------------------------------------------
	// Primitives & null
	// -----------------------------------------------------------------------

	it('returns primitives as-is (identity)', () => {
		expect(objectDeepClone(42)).toBe(42);
		expect(objectDeepClone('hello')).toBe('hello');
		expect(objectDeepClone(true)).toBe(true);
		expect(objectDeepClone(false)).toBe(false);
		expect(objectDeepClone(0)).toBe(0);
		expect(objectDeepClone(-0)).toBe(-0);
		expect(objectDeepClone(Number.NaN)).toBeNaN();
	});

	it('returns null and undefined as-is', () => {
		expect(objectDeepClone(null)).toBeNull();
		expect(objectDeepClone(undefined)).toBeUndefined();
	});

	// -----------------------------------------------------------------------
	// Plain objects
	// -----------------------------------------------------------------------

	it('clones a simple object', () => {
		const obj = { a: 1, b: 'hello' };
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual(obj);
		expect(cloned).not.toBe(obj);
	});

	it('clones an empty object', () => {
		const obj = {};
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual({});
		expect(cloned).not.toBe(obj);
	});

	it('clones deeply nested objects', () => {
		const obj = { a: { b: { c: { d: { e: 'value' } } } } };
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual(obj);
		expect(cloned.a.b.c.d).not.toBe(obj.a.b.c.d);
	});

	it('clones objects with null values', () => {
		const obj = { value: null };
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual(obj);
		expect(cloned.value).toBeNull();
	});

	it('clones objects with undefined values', () => {
		const obj = { value: undefined };
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual(obj);
		expect('value' in cloned).toBe(true);
	});

	it('does not share nested references', () => {
		const obj = { a: { b: 2 }, c: { d: 'hello' } };
		const cloned = objectDeepClone(obj);
		expect(cloned.a).not.toBe(obj.a);
		expect(cloned.c).not.toBe(obj.c);
	});

	// -----------------------------------------------------------------------
	// Arrays
	// -----------------------------------------------------------------------

	it('clones arrays inside objects', () => {
		const obj = { arr: [1, 2, 3] };
		const cloned = objectDeepClone(obj);
		expect(cloned.arr).toEqual([1, 2, 3]);
		expect(cloned.arr).not.toBe(obj.arr);
	});

	it('clones empty arrays', () => {
		const obj = { arr: [] as number[] };
		const cloned = objectDeepClone(obj);
		expect(cloned.arr).toEqual([]);
		expect(cloned.arr).not.toBe(obj.arr);
	});

	it('clones nested arrays', () => {
		const obj = { arr: [[1, 2], [3, 4]] };
		const cloned = objectDeepClone(obj);
		expect(cloned.arr).toEqual(obj.arr);
		expect(cloned.arr[0]).not.toBe(obj.arr[0]);
		expect(cloned.arr[1]).not.toBe(obj.arr[1]);
	});

	it('clones arrays directly', () => {
		const arr = [1, { a: 2 }, [3, 4]];
		const cloned = objectDeepClone(arr);
		expect(cloned).toEqual(arr);
		expect(cloned).not.toBe(arr);
		expect(cloned[1]).not.toBe(arr[1]);
		expect(cloned[2]).not.toBe(arr[2]);
	});

	// -----------------------------------------------------------------------
	// Built-in types: Date, RegExp, Map, Set
	// -----------------------------------------------------------------------

	it('clones Date objects', () => {
		const date = new Date('2024-01-01T00:00:00.000Z');
		const obj = { date };
		const cloned = objectDeepClone(obj);
		expect(cloned.date).toEqual(date);
		expect(cloned.date).not.toBe(date);
		expect(cloned.date).toBeInstanceOf(Date);
	});

	it('clones RegExp objects', () => {
		const regexp = /test/gi;
		const obj = { regexp };
		const cloned = objectDeepClone(obj);
		expect(cloned.regexp).toEqual(regexp);
		expect(cloned.regexp).not.toBe(regexp);
		expect(cloned.regexp).toBeInstanceOf(RegExp);
		expect(cloned.regexp.flags).toBe('gi');
	});

	it('clones Map objects', () => {
		const map = new Map<string, unknown>([
			['key', 'value'],
			['nested', { a: 1 }],
		]);
		const obj = { map };
		const cloned = objectDeepClone(obj);
		expect(cloned.map).toEqual(map);
		expect(cloned.map).not.toBe(map);
		expect(cloned.map).toBeInstanceOf(Map);
		expect(cloned.map.get('nested')).not.toBe(map.get('nested'));
	});

	it('clones Set objects', () => {
		const set = new Set([1, 2, 3]);
		const obj = { set };
		const cloned = objectDeepClone(obj);
		expect(cloned.set).toEqual(set);
		expect(cloned.set).not.toBe(set);
		expect(cloned.set).toBeInstanceOf(Set);
	});

	it('clones objects with mixed types', () => {
		const obj = {
			str: 'hello',
			num: 42,
			bool: true,
			arr: [1, 2, 3],
			nested: { key: 'value' },
			date: new Date('2024-06-15'),
			regexp: /pattern/g,
			map: new Map([['k', 'v']]),
			set: new Set([9]),
		};
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual(obj);
		expect(cloned).not.toBe(obj);
		expect(cloned.nested).not.toBe(obj.nested);
		expect(cloned.date).not.toBe(obj.date);
		expect(cloned.regexp).not.toBe(obj.regexp);
		expect(cloned.map).not.toBe(obj.map);
		expect(cloned.set).not.toBe(obj.set);
	});

	// -----------------------------------------------------------------------
	// Binary / typed-array types
	// -----------------------------------------------------------------------

	it('clones Uint8Array', () => {
		const original = new Uint8Array([1, 2, 3, 4]);
		const obj = { typed: original };
		const cloned = objectDeepClone(obj);
		expect(cloned.typed).toEqual(original);
		expect(cloned.typed).not.toBe(original);
		expect(cloned.typed).toBeInstanceOf(Uint8Array);
		expect([...cloned.typed]).toEqual([1, 2, 3, 4]);
	});

	it('clones ArrayBuffer', () => {
		const buf = new ArrayBuffer(4);
		const view = new Uint8Array(buf);
		view.set([10, 20, 30, 40]);
		const obj = { buf };
		const cloned = objectDeepClone(obj);
		expect(cloned.buf).not.toBe(buf);
		expect(cloned.buf).toBeInstanceOf(ArrayBuffer);
		expect(new Uint8Array(cloned.buf)).toEqual(view);
	});

	it('clones Buffer values (Node / Bun)', () => {
		const original = Buffer.from('hello');
		const obj = { buf: original };
		const cloned = objectDeepClone(obj);

		expect(cloned.buf).toEqual(original);
		expect(cloned.buf).not.toBe(original);
		// structuredClone may return Uint8Array on some runtimes;
		// either way it must be a typed-array view with correct bytes
		expect(ArrayBuffer.isView(cloned.buf)).toBe(true);
		expect(Buffer.from(cloned.buf).toString()).toBe('hello');
	});

	it('clones DataView', () => {
		const buf = new ArrayBuffer(4);
		const view = new DataView(buf);
		view.setInt16(0, 256);
		const obj = { view };
		const cloned = objectDeepClone(obj);
		expect(cloned.view).not.toBe(view);
		expect(cloned.view).toBeInstanceOf(DataView);
		expect(cloned.view.getInt16(0)).toBe(256);
	});

	// -----------------------------------------------------------------------
	// Circular references
	// -----------------------------------------------------------------------

	it('preserves circular references automatically', () => {
		const obj: any = { a: 1 };
		obj.self = obj;

		const cloned = objectDeepClone(obj);
		expect(cloned.a).toBe(1);
		expect(cloned.self).toBe(cloned);
	});

	it('preserves nested circular references', () => {
		const child: any = { name: 'child' };
		const parent: any = { name: 'parent', child };
		child.parent = parent;

		const cloned = objectDeepClone(parent);
		expect(cloned.name).toBe('parent');
		expect(cloned.child.name).toBe('child');
		expect(cloned.child.parent).toBe(cloned);
	});

	// -----------------------------------------------------------------------
	// protoProps option
	// -----------------------------------------------------------------------

	it('excludes prototype properties by default', () => {
		const obj: any = Object.create({ inherited: true });
		obj.own = 1;
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual({ own: 1 });
		expect(cloned).not.toHaveProperty('inherited');
	});

	it('includes prototype properties when protoProps is true', () => {
		const obj: any = Object.create({ inherited: true });
		obj.own = 1;
		const cloned = objectDeepClone(obj, { protoProps: true });
		expect(cloned).toEqual({ own: 1, inherited: true });
		expect(cloned).toHaveProperty('inherited', true);
	});

	it('protoProps: false explicitly excludes prototype properties', () => {
		const obj: any = Object.create({ a: 1 });
		const cloned = objectDeepClone(obj, { protoProps: false });
		expect(cloned).toEqual({});
	});

	it('protoProps works with nested objects that have prototypes', () => {
		const proto = { inherited: 'from-proto' };
		const child = Object.create(proto);
		(child as any).own = 'own-value';

		const obj = { nested: child };
		const cloned = objectDeepClone(obj, { protoProps: true });
		expect(cloned.nested).toEqual({ own: 'own-value', inherited: 'from-proto' });
	});

	it('protoProps works with arrays containing prototype-bearing objects', () => {
		const proto = { p: 99 };
		const item = Object.create(proto);
		(item as any).x = 1;

		const arr = [item];
		const cloned = objectDeepClone(arr, { protoProps: true });
		expect(cloned[0]).toEqual({ x: 1, p: 99 });
	});

	it('protoProps does not mutate the original object', () => {
		const proto = { inherited: 'keep' };
		const obj: any = Object.create(proto);
		obj.own = 'val';

		const cloned = objectDeepClone(obj, { protoProps: true });
		expect(cloned).toEqual({ own: 'val', inherited: 'keep' });
		// Original must still be prototypal
		expect(Object.getPrototypeOf(obj)).toBe(proto);
		expect(obj.inherited).toBe('keep');
	});

	it('protoProps flattens prototype-bearing values inside Maps', () => {
		const proto = { inherited: 'from-proto' };
		const child = Object.create(proto);
		(child as any).own = 'own-value';

		const map = new Map<string, unknown>([['entry', child]]);
		const cloned = objectDeepClone(map, { protoProps: true });

		expect(cloned).toBeInstanceOf(Map);
		expect(cloned.get('entry')).toEqual({
			own: 'own-value',
			inherited: 'from-proto',
		});
	});

	it('protoProps flattens prototype-bearing members inside Sets', () => {
		const proto = { inherited: 99 };
		const item = Object.create(proto);
		(item as any).x = 1;

		const set = new Set([item]);
		const cloned = objectDeepClone(set, { protoProps: true });

		expect(cloned).toBeInstanceOf(Set);
		const [first] = [...cloned];
		expect(first).toEqual({ x: 1, inherited: 99 });
	});

	// -----------------------------------------------------------------------
	// Edge cases
	// -----------------------------------------------------------------------

	it('handles Object.create(null)', () => {
		const obj: any = Object.create(null);
		obj.key = 'value';
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual({ key: 'value' });
		expect(cloned.key).toBe('value');
	});

	it('handles sparse arrays', () => {
		// eslint-disable-next-line no-sparse-arrays
		const arr = [1, , 3];
		const cloned = objectDeepClone(arr);
		expect(cloned).toEqual(arr);
		expect(1 in cloned).toBe(false);
	});

	it('handles large nested structures without stack overflow', () => {
		// Build a deeply nested object that is well within stack limits
		let obj: any = { value: 'bottom' };
		for (let i = 0; i < 1000; i++) {
			obj = { nested: obj };
		}
		const cloned = objectDeepClone(obj);
		expect(cloned).toEqual(obj);
	});

	it('produces independent mutable copies', () => {
		const obj = { a: { b: 1 } };
		const cloned = objectDeepClone(obj);
		cloned.a.b = 999;
		expect(obj.a.b).toBe(1);
	});

	// -----------------------------------------------------------------------
	// Non-cloneable values
	// -----------------------------------------------------------------------

	it('throws a friendly error for functions', () => {
		expect(() => objectDeepClone({ fn: () => {} })).toThrow(
			'objectDeepClone: the value contains data that cannot be cloned',
		);
	});

	it('throws a friendly error for symbols', () => {
		expect(() => objectDeepClone({ sym: Symbol('test') })).toThrow(
			'objectDeepClone: the value contains data that cannot be cloned',
		);
	});

	it('error includes the original DataCloneError as cause', () => {
		expect(() => objectDeepClone({ fn: () => {} })).toThrow(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			expect.objectContaining({ cause: expect.any(Error) as unknown }),
		);
	});

	// -----------------------------------------------------------------------
	// DeepCloneOptions type is exported
	// -----------------------------------------------------------------------

	it('exports the DeepCloneOptions type (compile-time check)', () => {
		// This test exists to verify the type is publicly importable.
		// If DeepCloneOptions were not exported the import would fail at
		// compile time, so the fact this file type-checks is the assertion.
		const opts: import('../../src/object/index.js').DeepCloneOptions = {
			protoProps: true,
		};
		expect(opts.protoProps).toBe(true);
	});
});

