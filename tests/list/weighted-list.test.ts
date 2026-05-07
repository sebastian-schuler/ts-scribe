import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { WeightedList } from '../../src/index.js';

describe('WeightedList', () => {
	let weightedList: WeightedList<string>;

	beforeEach(() => {
		weightedList = new WeightedList();
	});

	afterEach(() => {
		weightedList.clear();
	});

	it('should add items correctly', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		expect(weightedList.length).toBe(2);
		expect(weightedList.getTotalWeight()).toBe(5);
	});

	it('should return undefined when random is called on an empty list', () => {
		expect(weightedList.random()).toBeUndefined();
	});

	it('should return a random item based on weights', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		const randomItem = weightedList.random();
		expect(randomItem).toBeDefined();
		expect(randomItem).toMatch(/item1|item2/);
	});

	it('should return all items', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		expect(weightedList.values()).toEqual(['item1', 'item2']);
	});

	it('should return all items with their weights', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		expect(weightedList.weights()).toEqual([
			{ data: 'item1', weight: 2 },
			{ data: 'item2', weight: 3 },
		]);
	});

	it('should return the correct probability of an item', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		expect(weightedList.probability(0)).toBe(2 / 5);
		expect(weightedList.probability(1)).toBe(3 / 5);
	});

	it('should return and remove a random item', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		const randomItem = weightedList.popRandom();
		expect(randomItem).toBeDefined();
		expect(weightedList.length).toBe(1);
	});

	it('should clear all items', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		weightedList.clear();
		expect(weightedList.length).toBe(0);
		expect(weightedList.getTotalWeight()).toBe(0);
	});

	it('should return a string representation', () => {
		weightedList.push({ data: 'item1', weight: 2 }, { data: 'item2', weight: 3 });
		const stringRepresentation = weightedList.toString();
		expect(stringRepresentation).toMatch(/length: 2/);
		expect(stringRepresentation).toMatch(/totalWeight: 5/);
		expect(stringRepresentation).toMatch(
			/items: \[\s+{\s+object: item1\s+weight: 2\s+},\s+{\s+object: item2\s+weight: 3\s+}\s+]/,
		);
	});

	it('should handle popRandom until list is empty, then return undefined', () => {
		weightedList.push({ data: 'a', weight: 10 }, { data: 'b', weight: 20 }, { data: 'c', weight: 30 });
		expect(weightedList.length).toBe(3);

		// Pop all items
		expect(weightedList.popRandom()).toBeDefined();
		expect(weightedList.popRandom()).toBeDefined();
		expect(weightedList.popRandom()).toBeDefined();

		expect(weightedList.length).toBe(0);
		expect(weightedList.getTotalWeight()).toBe(0);
		expect(weightedList.popRandom()).toBeUndefined();
		expect(weightedList.random()).toBeUndefined();
	});

	it('should continue working correctly after popRandom + push', () => {
		weightedList.push({ data: 'x', weight: 5 }, { data: 'y', weight: 15 });
		weightedList.popRandom(); // Remove one random item
		weightedList.push({ data: 'z', weight: 10 });

		expect(weightedList.length).toBe(2);
		expect(weightedList.getTotalWeight()).toBeGreaterThan(0);
		const item = weightedList.random();
		expect(item).toBeDefined();
	});

	it('should handle weight-0 items (always selected when only item)', () => {
		weightedList.push({ data: 'zero', weight: 0 });
		expect(weightedList.length).toBe(1);
		expect(weightedList.getTotalWeight()).toBe(0);

		// With a single weight-0 item, random() should always return it
		for (let i = 0; i < 10; i++) {
			expect(weightedList.random()).toBe('zero');
		}
	});

	it('should handle weight-0 items alongside weighted items', () => {
		weightedList.push({ data: 'zero', weight: 0 }, { data: 'positive', weight: 10 });
		// Weight-0 item should never be randomly selected (proportional weight of 0)
		for (let i = 0; i < 50; i++) {
			expect(weightedList.random()).toBe('positive');
		}
	});

	it('should return undefined for probability with out-of-bounds index', () => {
		weightedList.push({ data: 'item', weight: 5 });
		expect(weightedList.probability(-1)).toBeUndefined();
		expect(weightedList.probability(1)).toBeUndefined();
		expect(weightedList.probability(100)).toBeUndefined();
	});

	it('should copy entries when constructed from another WeightedList', () => {
		weightedList.push({ data: 'a', weight: 1 }, { data: 'b', weight: 2 });
		const clone = new WeightedList(weightedList);

		expect(clone.length).toBe(2);
		expect(clone.getTotalWeight()).toBe(3);
		expect(clone.values()).toEqual(['a', 'b']);

		// Modifying clone should not affect original
		clone.push({ data: 'c', weight: 3 });
		expect(clone.length).toBe(3);
		expect(weightedList.length).toBe(2);
	});
});
