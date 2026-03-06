import { type Nestable } from '../types/common-types.js';

type Reference = Record<string, Nestable>;

/**
 * Checks if two values are primitives or null and compares them.
 * Returns undefined if both values are objects (need further comparison).
 */
function comparePrimitives(object1: Nestable, object2: Nestable): boolean | undefined {
	if (
		object1 === null ||
		object2 === null ||
		typeof object1 !== 'object' ||
		typeof object2 !== 'object' ||
		object1 === undefined ||
		object2 === undefined
	) {
		return object1 === object2;
	}

	return undefined;
}

/**
 * Compares two arrays for deep equality.
 */
function compareArrays(
	array1: Nestable[],
	array2: Nestable[],
	valueRefs: Reference[],
	otherRefs: Reference[],
): boolean {
	// Check for circular references in arrays
	const valueRefIndex = valueRefs.indexOf(array1 as unknown as Reference);
	const otherRefIndex = otherRefs.indexOf(array2 as unknown as Reference);

	if (valueRefIndex === otherRefIndex && valueRefIndex >= 0) {
		return true;
	}

	// Add arrays to reference tracking
	valueRefs.push(array1 as unknown as Reference);
	otherRefs.push(array2 as unknown as Reference);

	if (array1.length !== array2.length) {
		return false;
	}

	for (const [i, element] of array1.entries()) {
		if (!deepEqualsRecursive(element, array2[i], [...valueRefs], [...otherRefs])) {
			return false;
		}
	}

	return true;
}

/**
 * Checks for circular references and updates reference arrays.
 * Returns true if circular references match, undefined if no circular reference found.
 */
function checkCircularReferences(
	object1: Reference,
	object2: Reference,
	valueRefs: Reference[],
	otherRefs: Reference[],
): boolean | undefined {
	const valueRefIndex = valueRefs.indexOf(object1);
	const otherRefIndex = otherRefs.indexOf(object2);

	if (valueRefIndex === otherRefIndex && valueRefIndex >= 0) {
		return true;
	}

	valueRefs.push(object1);
	otherRefs.push(object2);
	return undefined;
}

/**
 * Compares the properties of two objects for deep equality.
 */
function compareObjectProperties(
	object1: Reference,
	object2: Reference,
	valueRefs: Reference[],
	otherRefs: Reference[],
): boolean {
	for (const key in object1) {
		if (
			Object.hasOwn(object1, key) &&
			!deepEqualsRecursive(object1[key], object2[key], [...valueRefs], [...otherRefs])
		) {
			return false;
		}
	}

	return true;
}

/**
 * Deeply compares two nestable objects to determine if they are equal.
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @param valueRefs - An array of references to the first object.
 * @param otherRefs - An array of references to the second object.
 * @returns `true` if the objects are equal, `false` otherwise.
 */
function deepEqualsRecursive(object1: Nestable, object2: Nestable, valueRefs?: Reference[], otherRefs?: Reference[]) {
	// Check primitives first
	const primitiveResult = comparePrimitives(object1, object2);
	if (primitiveResult !== undefined) {
		return primitiveResult;
	}

	// Initialize reference arrays
	valueRefs ??= [];
	otherRefs ??= [];

	// Handle array comparison
	if (Array.isArray(object1) && Array.isArray(object2)) {
		return compareArrays(object1, object2, valueRefs, otherRefs);
	}

	if (Array.isArray(object1) || Array.isArray(object2)) {
		return false;
	}

	// Get the value type
	const type = Object.prototype.toString.call(object1);

	// If the two objects are not the same type, return false
	if (type !== Object.prototype.toString.call(object2)) return false;

	// If items are not an object, return false
	if (type !== '[object Object]') return false;

	// Check for circular references
	const circularResult = checkCircularReferences(object1 as Reference, object2 as Reference, valueRefs, otherRefs);
	if (circularResult !== undefined) {
		return circularResult;
	}

	// Compare the length of the two items
	// @ts-expect-error - We have already checked that both items are objects, so this type assertion is safe
	const valueLength = Object.keys(object1).length;
	// @ts-expect-error - We have already checked that both items are objects, so this type assertion is safe
	const otherLength = Object.keys(object2).length;
	if (valueLength !== otherLength) return false;

	// Compare properties
	return compareObjectProperties(object1 as Reference, object2 as Reference, valueRefs, otherRefs);
}

/**
 * Compares two objects (or nested structures) for deep equality.
 * This function performs a recursive comparison to check if the two objects are equivalent, including all nested properties or elements.
 * It returns `true` if the objects are deeply equal, and `false` otherwise.
 *
 * @category Object
 * @param {Nestable} object1 - The first object or nested structure to compare.
 * @param {Nestable} object2 - The second object or nested structure to compare.
 * @returns {boolean} `true` if the objects are deeply equal, `false` otherwise.
 *
 * @example
 * const object1 = { a: 1, b: { x: 2, y: 3 } };
 * const object2 = { a: 1, b: { x: 2, y: 3 } };
 * const object3 = { a: 1, b: { x: 2, y: 4 } };
 *
 * objectDeepEquals(object1, object2); // true
 * objectDeepEquals(object1, object3); // false
 */
export function objectDeepEquals(object1: Nestable, object2: Nestable): boolean {
	return deepEqualsRecursive(object1, object2);
}
