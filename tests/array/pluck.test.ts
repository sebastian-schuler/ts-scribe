import { describe, expect, it } from 'bun:test';
import { arrayPluck } from '../../src/array/index.js';

type Stooge = {
	name: string;
	age: number;
};

describe('pluckArray', () => {
	const stooges: Stooge[] = [
		{ name: 'moe', age: 40 },
		{ name: 'larry', age: 50 },
		{ name: 'curly', age: 60 },
	];

	it('should return an array of names', () => {
		const names: string[] = arrayPluck(stooges, 'name');
		expect(names).toEqual(['moe', 'larry', 'curly']);
	});

	it('should return an array of ages', () => {
		const ages: number[] = arrayPluck(stooges, 'age');
		expect(ages).toEqual([40, 50, 60]);
	});

	it('should return an empty array for an empty input array', () => {
		const emptyArray: Stooge[] = [];
		const result: string[] = arrayPluck(emptyArray, 'name');
		expect(result).toEqual([]);
	});

	it('should handle non-existing keys by returning undefined', () => {
		const result: Array<string | undefined> = arrayPluck(stooges, 'nonExistingKey' as any);
		expect(result).toEqual([undefined, undefined, undefined]);
	});
});
