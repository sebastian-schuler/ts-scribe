import { describe, expect, it } from 'bun:test';
import { getIn } from '../../src/core/index.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const data = {
	user: {
		profile: {
			name: 'Alice',
			age: undefined as number | undefined,
			addresses: [
				{ city: 'NYC', zip: 10_001 },
				{ city: 'LA', zip: 90_001 },
			],
		},
	},
};

/** Deeply nested structure with optional properties, unions, and arrays of arrays. */
const complex = {
	org: {
		name: 'Acme',
		departments: [
			{
				id: 1,
				title: 'Engineering',
				lead: { name: 'Bob', active: true },
				members: [
					{ id: 10, name: 'Carol', skills: ['ts', 'rust'] },
					{ id: 11, name: 'Dave', skills: ['go', 'python'] },
				],
			},
			{
				id: 2,
				title: 'Design',
				lead: { name: 'Eve', active: false },
				members: [{ id: 20, name: 'Frank', skills: ['figma'] }],
			},
		],
		config: {
			flags: { darkMode: true, beta: false },
			limits: { maxUsers: 500, maxProjects: 50 },
		},
	},
	meta: {
		version: '2.0.0',
		tags: ['stable', 'lts'],
	},
};

/** Object with numeric keys. */
const numericKeys = { 0: 'zero', 1: 'one', 2: 'two' } as const;

/** Readonly tuple. */
const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] as const;

/** Nullable / optional nesting. */
const nullable = {
	a: null as null | { b: { c: 42 } },
	b: undefined as undefined | { x: number },
	c: { d: { e: { f: 'deep' } } },
} as const;

/** Map of Maps. */
const nestedMap = new Map<string, Map<string, number>>([
	['row0', new Map([['col0', 1], ['col1', 2]])],
	['row1', new Map([['col0', 3], ['col1', 4]])],
]);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getIn', () => {
	// -------------------------------------------------------------------------
	// Core traversal
	// -------------------------------------------------------------------------

	describe('core traversal', () => {
		it('should resolve nested object keys', () => {
			expect(getIn(data, ['user', 'profile', 'name'])).toBe('Alice');
		});

		it('should resolve array elements by numeric index', () => {
			expect(getIn(data, ['user', 'profile', 'addresses', 0, 'city'])).toBe('NYC');
			expect(getIn(data, ['user', 'profile', 'addresses', 1, 'zip'])).toBe(90_001);
		});

		it('should return undefined for a missing key (correctly a type error at compile time)', () => {
			// @ts-expect-error — 'missing' is not a valid key; TypeScript rejects this path
			expect(getIn(data, ['user', 'profile', 'missing'])).toBeUndefined();
		});

		it('should return the default value when the resolved value is undefined', () => {
			expect(getIn(data, ['user', 'profile', 'age'], 25)).toBe(25);
		});

		it('should return the default value when an intermediate key is null', () => {
			const obj = { a: null } as { a: null | { b: number } };
			expect(getIn(obj, ['a', 'b'], 99)).toBe(99);
		});

		it('should return the default value when an intermediate key is undefined', () => {
			const obj = { a: undefined } as { a: undefined | { b: number } };
			expect(getIn(obj, ['a', 'b'], 42)).toBe(42);
		});

		it('should return falsy values without falling through to the default', () => {
			const obj = { n: 0, b: false };
			expect(getIn(obj, ['n'], 99)).toBe(0);
			expect(getIn(obj, ['b'], true)).toBe(false);
		});

		it('should handle deeply nested paths', () => {
			const deep = { a: { b: { c: { d: 'deep' } } } };
			expect(getIn(deep, ['a', 'b', 'c', 'd'])).toBe('deep');
		});

		it('should not mutate the source object', () => {
			const original = { x: { y: 1 } };
			const snapshot = JSON.parse(JSON.stringify(original)) as typeof original;
			getIn(original, ['x', 'y']);
			expect(original).toEqual(snapshot);
		});
	});

	// -------------------------------------------------------------------------
	// Complex nested structures
	// -------------------------------------------------------------------------

	describe('complex objects', () => {
		it('should resolve deeply into an array-of-objects-with-arrays structure', () => {
			expect(getIn(complex, ['org', 'departments', 0, 'lead', 'name'])).toBe('Bob');
			expect(getIn(complex, ['org', 'departments', 1, 'lead', 'active'])).toBe(false);
		});

		it('should resolve nested arrays inside array elements', () => {
			expect(getIn(complex, ['org', 'departments', 0, 'members', 1, 'name'])).toBe('Dave');
			expect(getIn(complex, ['org', 'departments', 1, 'members', 0, 'id'])).toBe(20);
		});

		it('should resolve boolean flags in a nested config object', () => {
			expect(getIn(complex, ['org', 'config', 'flags', 'darkMode'])).toBe(true);
			expect(getIn(complex, ['org', 'config', 'flags', 'beta'])).toBe(false);
		});

		it('should resolve numeric limits', () => {
			expect(getIn(complex, ['org', 'config', 'limits', 'maxUsers'])).toBe(500);
		});

		it('should resolve top-level metadata', () => {
			expect(getIn(complex, ['meta', 'version'])).toBe('2.0.0');
			expect(getIn(complex, ['meta', 'tags', 0])).toBe('stable');
		});

		it('should return undefined for an out-of-bounds array index inside a nested structure', () => {
			expect(getIn(complex, ['org', 'departments', 0, 'members', 99, 'name'])).toBeUndefined();
		});

		it('should return the default for a missing deep key', () => {
			expect(getIn(complex, ['org', 'departments', 0, 'lead', 'active'], false)).toBe(true);
			expect(getIn(complex, ['org', 'departments', 1, 'lead', 'active'], true)).toBe(false);
		});

		it('should resolve numeric keys on a plain object', () => {
			expect(getIn(numericKeys, [0])).toBe('zero');
			expect(getIn(numericKeys, [2])).toBe('two');
		});

		it('should resolve values from a matrix (array of arrays)', () => {
			expect(getIn(matrix, [0, 2])).toBe(3);
			expect(getIn(matrix, [2, 0])).toBe(7);
		});

		it('should short-circuit on null intermediate and return the default', () => {
			expect(getIn(nullable, ['a', 'b', 'c'], -1 as unknown)).toBe(-1);
		});

		it('should short-circuit on undefined intermediate and return the default', () => {
			expect(getIn(nullable, ['b', 'x'], 0)).toBe(0);
		});

		it('should resolve through optional-chaining-equivalent paths that exist', () => {
			expect(getIn(nullable, ['c', 'd', 'e', 'f'])).toBe('deep');
		});

		it('should handle arrays that contain optional-typed items', () => {
			const sparse = [undefined, { val: 99 }, undefined] as Array<{ val: number } | undefined>;
			expect(getIn(sparse, [1, 'val'])).toBe(99);
			expect(getIn(sparse, [0, 'val'], -1)).toBe(-1);
		});
	});

	// -------------------------------------------------------------------------
	// Map support
	// -------------------------------------------------------------------------

	describe('Map support', () => {
		it('should resolve a value stored in a Map', () => {
			const map = new Map<string, { score: number }>([['alice', { score: 100 }]]);
			expect(getIn(map, ['alice', 'score'])).toBe(100);
		});

		it('should return undefined for a missing Map key', () => {
			const map = new Map<string, number>([['a', 1]]);
			expect(getIn(map, ['missing'])).toBeUndefined();
		});

		it('should return the default value for a missing Map key', () => {
			const map = new Map<string, number>([['a', 1]]);
			expect(getIn(map, ['missing'], -1)).toBe(-1);
		});

		it('should resolve values in a nested Map-of-Maps', () => {
			expect(getIn(nestedMap, ['row0', 'col1'])).toBe(2);
			expect(getIn(nestedMap, ['row1', 'col0'])).toBe(3);
		});

		it('should return undefined for a missing outer key in a nested Map', () => {
			expect(getIn(nestedMap, ['rowX', 'col0'])).toBeUndefined();
		});
	});

	// -------------------------------------------------------------------------
	// Edge cases
	// -------------------------------------------------------------------------

	describe('edge cases', () => {
		it('should return the root object when path is empty', () => {
			expect(getIn(data, [])).toBe(data);
		});

		it('should return the default when root is null', () => {
			const nullish = null as { a: { b: string } } | null;
			expect(getIn(nullish, ['a', 'b'], 'default')).toBe('default');
		});

		it('should return the default when root is undefined', () => {
			const undef = undefined as { a: { b: string } } | undefined;
			expect(getIn(undef, ['a', 'b'], 'default')).toBe('default');
		});

		it('should handle index out of bounds by returning undefined', () => {
			expect(getIn(data, ['user', 'profile', 'addresses', 99, 'city'])).toBeUndefined();
		});

		it('should treat 0 / false / empty-string resolved values as defined (not fall through)', () => {
			const obj = { a: 0, b: false, c: '' };
			expect(getIn(obj, ['a'], -1)).toBe(0);
			expect(getIn(obj, ['b'], true)).toBe(false);
			expect(getIn(obj, ['c'], 'fallback')).toBe('');
		});

		it('should handle single-key paths', () => {
			expect(getIn({ x: 42 }, ['x'])).toBe(42);
		});

		it('should return undefined when the value at the path is explicitly undefined', () => {
			const obj = { a: undefined } as { a: undefined };
			expect(getIn(obj, ['a'])).toBeUndefined();
		});

		it('should work on arrays passed as the root', () => {
			const arr = [10, 20, 30];
			expect(getIn(arr, [2])).toBe(30);
			expect(getIn(arr, [5], -1)).toBe(-1);
		});

		it('should support Python-style negative array indices', () => {
			const arr = [10, 20, 30];
			expect(getIn(arr, [-1])).toBe(30); // last element
			expect(getIn(arr, [-2])).toBe(20); // second to last
			expect(getIn(arr, [-3])).toBe(10); // first element via negative
			expect(getIn(arr, [-4])).toBeUndefined(); // out of bounds
			expect(getIn(arr, [-4], 99)).toBe(99);
		});

		it('should work on null-prototype objects (Object.create(null))', () => {
			const obj = Object.assign(Object.create(null) as object, { a: { b: 42 } }) as { a: { b: number } };
			expect(getIn(obj, ['a', 'b'])).toBe(42);
		});

		it('should resolve numeric keys on a Map<number, V>', () => {
			const map = new Map<number, string>([[0, 'zero'], [1, 'one']]);
			expect(getIn(map, [0])).toBe('zero');
			expect(getIn(map, [1])).toBe('one');
			expect(getIn(map, [99])).toBeUndefined();
		});

		it('should return undefined whether the key is missing or held undefined (defaultValue cannot distinguish the two)', () => {
			const obj = { a: undefined } as { a: undefined };
			// Both cases produce undefined — the function cannot distinguish them
			expect(getIn(obj, ['a'])).toBeUndefined();
			expect(getIn(obj, ['a'], undefined)).toBeUndefined();
		});
	});
});

