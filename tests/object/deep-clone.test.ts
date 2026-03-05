import { describe, expect, it } from 'bun:test';
import { objectDeepClone } from '../../src/object/index.js';

describe('deepClone', () => {
	// Test case for cloning a simple object
	it('should clone a simple object', () => {
		const object = { a: 1, b: 'hello' };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object); // Ensure it's a deep clone
	});

	// Test case for cloning an object with nested objects
	it('should clone an object with nested objects', () => {
		const object = { a: { b: 2 }, c: { d: 'hello' } };
		const clonedObject = objectDeepClone(object);
		expect(clonedObject).toEqual(object);
		expect(clonedObject).not.toBe(object); // Ensure it's a deep clone
	});

	// Test case for maintaining circular references
	it('should maintain circular references if specified in options', () => {
		const object: any = { a: 1 };
		object.self = object; // Creating a circular reference
		const clonedObject = objectDeepClone(object, { circleRefs: true });
		expect(clonedObject).toEqual(object);
		expect(clonedObject.self).toBe(clonedObject); // Ensure circular reference is maintained
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
		expect(clonedObject).not.toBe(object); // Ensure it's a deep clone
		expect(Object.getPrototypeOf(clonedObject)).not.toEqual({ prototypeProp: true }); // Ensure prototype properties are not cloned
	});
});
