import { describe, expect, it } from 'bun:test';
import { objectDeepClone } from '../../src/object/index.js';

describe('deepClone', () => {
	// Test case for cloning a simple object
	it('should clone a simple object', () => {
		const object = { a: 1, b: 'hello' };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object);
	});

	// Test case for cloning an object with nested objects
	it('should clone an object with nested objects', () => {
		const object = { a: { b: 2 }, c: { d: 'hello' } };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object);
	});

	// Test case for maintaining circular references
	it('should maintain circular references if specified in options', () => {
		const object: any = { a: 1 };
		object.self = object;
		const clonedObject = objectDeepClone(object, { circleRefs: true });
		expect(clonedObject).toEqual(object);
		expect(clonedObject.self).toBe(clonedObject);
	});

	// Test case for cloning with prototype properties
	it('should clone with prototype properties if specified in options', () => {
		const clone1 = objectDeepClone(Object.create({ a: 1 }), { protoProps: false });
		const clone2 = objectDeepClone(Object.create({ a: 1 }), { protoProps: true });

		expect(clone1).toEqual({});
		expect(clone1).not.toEqual({ a: 1 });
		expect(clone2).toEqual({ a: 1 });
	});

	// Test case for not cloning prototype properties
	it('should not clone prototype properties if not specified in options', () => {
		const object: any = Object.create({ prototypeProp: true });
		object.a = 1;
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object);
		expect(Object.getPrototypeOf(clonedObject)).not.toEqual({ prototypeProp: true });
	});

	// Test case for cloning arrays
	it('should clone arrays', () => {
		const object = { arr: [1, 2, 3] };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject.arr).not.toBe(object.arr);
	});

	// Test case for cloning nested arrays
	it('should clone nested arrays', () => {
		const object = { arr: [[1, 2], [3, 4]] };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject.arr[0]).not.toBe(object.arr[0]);
	});

	// Test case for cloning Date objects
	it('should clone Date objects', () => {
		const date = new Date('2024-01-01');
		const object = { date };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject.date).toEqual(date);
		expect(clonedObject.date).not.toBe(date);
	});

	// Test case for cloning null values
	it('should handle null values', () => {
		const object = { value: null };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject.value).toBe(null);
	});

	// Test case for cloning undefined values
	it('should handle undefined values', () => {
		const object = { value: undefined };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
	});

	// Test case for cloning primitives
	it('should clone primitives', () => {
		expect(objectDeepClone(42)).toBe(42);
		expect(objectDeepClone('hello')).toBe('hello');
		expect(objectDeepClone(true)).toBe(true);
	});

	// Test case for cloning empty object
	it('should clone an empty object', () => {
		const object = {};
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object);
	});

	// Test case for cloning empty array
	it('should clone an empty array', () => {
		const object = { arr: [] };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject.arr).toEqual([]);
		expect(clonedObject.arr).not.toBe(object.arr);
	});

	// Test case for cloning deeply nested structures
	it('should clone deeply nested structures', () => {
		const object = { a: { b: { c: { d: { e: 'value' } } } } };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject.a.b.c.d).not.toBe(object.a.b.c.d);
	});

	// Test case for cloning RegExp
	it('should clone RegExp objects', () => {
		const regexp = /test/gi;
		const object = { regexp };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject.regexp).toEqual(regexp);
		expect(clonedObject.regexp).not.toBe(regexp);
	});

	// Test case for cloning Set and Map
	it('should clone Set and Map objects', () => {
		const set = new Set([1, 2, 3]);
		const map = new Map([['key', 'value']]);
		const object = { set, map };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject.set).toEqual(set);
		expect(clonedObject.set).not.toBe(set);
		expect(clonedObject.map).toEqual(map);
		expect(clonedObject.map).not.toBe(map);
	});

	// Test case for cloning mixed types
	it('should clone objects with mixed types', () => {
		const object = {
			str: 'hello',
			num: 42,
			bool: true,
			arr: [1, 2, 3],
			nested: { key: 'value' },
			date: new Date(),
		};
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object);
		expect(clonedObject.nested).not.toBe(object.nested);
		expect(clonedObject.date).not.toBe(object.date);
	});
});
