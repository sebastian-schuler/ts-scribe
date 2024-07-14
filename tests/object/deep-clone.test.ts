import { deepClone } from '../../src/object';

describe('deepClone', () => {
  // Test case for cloning a simple object
  it('should clone a simple object', () => {
    const obj = { a: 1, b: 'hello' };
    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj); // Ensure it's a deep clone
  });

  // Test case for cloning an object with nested objects
  it('should clone an object with nested objects', () => {
    const obj = { a: { b: 2 }, c: { d: 'hello' } };
    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj); // Ensure it's a deep clone
  });

  // Test case for maintaining circular references
  it('should maintain circular references if specified in options', () => {
    const obj: any = { a: 1 };
    obj.self = obj; // Creating a circular reference
    const clonedObj = deepClone(obj, { circleRefs: true });
    expect(clonedObj).toEqual(obj);
    expect(clonedObj.self).toBe(clonedObj); // Ensure circular reference is maintained
  });

  // Test case for cloning with prototype properties
  it('should clone with prototype properties if specified in options', () => {
    const clone1 = deepClone(Object.create({ a: 1 }), { protoProps: false });
    const clone2 = deepClone(Object.create({ a: 1 }), { protoProps: true });

    expect(clone1).toEqual({});
    expect(clone1).not.toEqual({ a: 1 });
    expect(clone2).toEqual({ a: 1 });
  });

  // Test case for not cloning prototype properties
  it('should not clone prototype properties if not specified in options', () => {
    const obj: any = Object.create({ prototypeProp: true });
    obj.a = 1;
    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj); // Ensure it's a deep clone
    expect(Object.getPrototypeOf(clonedObj)).not.toEqual({ prototypeProp: true }); // Ensure prototype properties are not cloned
  });
});
