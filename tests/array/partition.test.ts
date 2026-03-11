import { describe, expect, it } from 'bun:test';
import { arrayPartition } from '../../src/array/index.js';

describe('arrayPartition', () => {
	// -------------------------------------------------------------------------
	// Basic functionality
	// -------------------------------------------------------------------------

	it('should partition numbers into even and odd', () => {
		const result = arrayPartition([1, 2, 3, 4, 5], x => x % 2 === 0);
		expect(result).toEqual([[2, 4], [1, 3, 5]]);
	});

	it('should preserve relative order in both output arrays', () => {
		const result = arrayPartition([5, 1, 4, 2, 3], x => x > 3);
		expect(result).toEqual([[5, 4], [1, 2, 3]]);
	});

	it('should return a tuple of exactly two arrays', () => {
		const result = arrayPartition([1, 2, 3], x => x > 1);
		expect(result).toHaveLength(2);
		expect(Array.isArray(result[0])).toBe(true);
		expect(Array.isArray(result[1])).toBe(true);
	});

	// -------------------------------------------------------------------------
	// Edge cases — empty / boundary inputs
	// -------------------------------------------------------------------------

	it('should return two empty arrays for an empty input', () => {
		const result = arrayPartition<number>([], () => true);
		expect(result).toEqual([[], []]);
	});

	it('should put all elements in the first array when all match', () => {
		const result = arrayPartition([1, 2, 3], () => true);
		expect(result).toEqual([[1, 2, 3], []]);
	});

	it('should put all elements in the second array when none match', () => {
		const result = arrayPartition([1, 2, 3], () => false);
		expect(result).toEqual([[], [1, 2, 3]]);
	});

	it('should handle a single element that matches', () => {
		const result = arrayPartition([42], x => x > 0);
		expect(result).toEqual([[42], []]);
	});

	it('should handle a single element that does not match', () => {
		const result = arrayPartition([42], x => x < 0);
		expect(result).toEqual([[], [42]]);
	});

	// -------------------------------------------------------------------------
	// Index-aware predicate
	// -------------------------------------------------------------------------

	it('should pass the correct index to the predicate', () => {
		const capturedIndices: number[] = [];
		arrayPartition(['a', 'b', 'c'], (_, i) => {
			capturedIndices.push(i);
			return true;
		});
		expect(capturedIndices).toEqual([0, 1, 2]);
	});

	it('should partition by even/odd index', () => {
		const result = arrayPartition(['a', 'b', 'c', 'd'], (_, i) => i % 2 === 0);
		expect(result).toEqual([['a', 'c'], ['b', 'd']]);
	});

	it('should pass the value and index independently', () => {
		const calls: Array<[number, number]> = [];
		arrayPartition([10, 20, 30], (v, i) => {
			calls.push([v, i]);
			return true;
		});
		expect(calls).toEqual([[10, 0], [20, 1], [30, 2]]);
	});

	// -------------------------------------------------------------------------
	// Type narrowing via type predicates
	// -------------------------------------------------------------------------

	it('should narrow types with a string type predicate', () => {
		const mixed: Array<string | number> = [1, 'a', 2, 'b', 3];
		const [strings, numbers] = arrayPartition(
			mixed,
			(x): x is string => typeof x === 'string',
		);
		expect(strings).toEqual(['a', 'b']);
		expect(numbers).toEqual([1, 2, 3]);
	});

	it('should narrow object union types with a type predicate', () => {
		type Circle = { kind: 'circle'; radius: number };
		type Square = { kind: 'square'; side: number };
		const shapes: Array<Circle | Square> = [
			{ kind: 'circle', radius: 5 },
			{ kind: 'square', side: 3 },
			{ kind: 'circle', radius: 2 },
		];
		const [circles, squares] = arrayPartition(
			shapes,
			(s): s is Circle => s.kind === 'circle',
		);
		expect(circles).toHaveLength(2);
		expect(squares).toHaveLength(1);
		expect(circles[0]?.radius).toBe(5);
		expect(squares[0]?.side).toBe(3);
	});

	// -------------------------------------------------------------------------
	// Different element types
	// -------------------------------------------------------------------------

	it('should work with strings', () => {
		const words = ['apple', 'banana', 'cherry', 'apricot'];
		const [aWords, rest] = arrayPartition(words, w => w.startsWith('a'));
		expect(aWords).toEqual(['apple', 'apricot']);
		expect(rest).toEqual(['banana', 'cherry']);
	});

	it('should work with objects', () => {
		const users = [
			{ name: 'Alice', active: true },
			{ name: 'Bob', active: false },
			{ name: 'Charlie', active: true },
		];
		const [active, inactive] = arrayPartition(users, u => u.active);
		expect(active).toEqual([
			{ name: 'Alice', active: true },
			{ name: 'Charlie', active: true },
		]);
		expect(inactive).toEqual([{ name: 'Bob', active: false }]);
	});

	it('should work with booleans', () => {
		const result = arrayPartition([true, false, true, false], x => x);
		expect(result).toEqual([[true, true], [false, false]]);
	});

	it('should handle null and undefined values', () => {
		const arr = [1, null, 2, undefined, 3];
		const [defined, nullish] = arrayPartition(arr, x => x != null);
		expect(defined).toEqual([1, 2, 3]);
		expect(nullish).toEqual([null, undefined]);
	});

	it('should work with nested arrays as elements', () => {
		const matrix = [[1, 2], [3], [4, 5, 6], []];
		const [long, short] = arrayPartition(matrix, row => row.length > 1);
		expect(long).toEqual([[1, 2], [4, 5, 6]]);
		expect(short).toEqual([[3], []]);
	});

	// -------------------------------------------------------------------------
	// Readonly input
	// -------------------------------------------------------------------------

	it('should accept a readonly array as input', () => {
		const frozen = Object.freeze([1, 2, 3, 4]) as readonly number[];
		const result = arrayPartition(frozen, x => x % 2 === 0);
		expect(result).toEqual([[2, 4], [1, 3]]);
	});

	it('should accept a const-asserted tuple as input', () => {
		const tuple = [10, 20, 30, 40] as const;
		const result = arrayPartition(tuple, x => x > 20);
		expect(result).toEqual([[30, 40], [10, 20]]);
	});

	// -------------------------------------------------------------------------
	// Mutation safety
	// -------------------------------------------------------------------------

	it('should not mutate the original array', () => {
		const original = [1, 2, 3, 4];
		arrayPartition(original, x => x % 2 === 0);
		expect(original).toEqual([1, 2, 3, 4]);
	});

	it('should return independent arrays that do not share references with the input', () => {
		const original = [1, 2, 3];
		const [truthy] = arrayPartition(original, x => x > 0);
		truthy.push(99);
		expect(original).toEqual([1, 2, 3]);
		expect(truthy).toEqual([1, 2, 3, 99]);
	});

	// -------------------------------------------------------------------------
	// Complex predicates
	// -------------------------------------------------------------------------

	it('should work with a predicate using both value and index', () => {
		// Keep elements where value > index
		const result = arrayPartition([5, 1, 3, 0, 9], (v, i) => v > i);
		expect(result).toEqual([[5, 3, 9], [1, 0]]);
	});

	it('should work with a stateful predicate (closure)', () => {
		let seen = 0;
		const [first, rest] = arrayPartition([10, 20, 30, 40, 50], () => {
			seen++;
			return seen <= 2;
		});
		expect(first).toEqual([10, 20]);
		expect(rest).toEqual([30, 40, 50]);
	});

	// -------------------------------------------------------------------------
	// Large arrays (performance / correctness at scale)
	// -------------------------------------------------------------------------

	it('should correctly partition a large array', () => {
		const large = Array.from({ length: 10_000 }, (_, i) => i);
		const [evens, odds] = arrayPartition(large, x => x % 2 === 0);
		expect(evens).toHaveLength(5000);
		expect(odds).toHaveLength(5000);
		expect(evens[0]).toBe(0);
		expect(evens[4999]).toBe(9998);
		expect(odds[0]).toBe(1);
		expect(odds[4999]).toBe(9999);
	});
});
