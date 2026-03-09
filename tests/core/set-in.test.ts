import { describe, expect, it } from 'bun:test';
import { setIn } from '../../src/core/index.js';

describe('setIn', () => {
	it('should immutably set a nested object value', () => {
		const input = { user: { profile: { name: 'Alice' } } };
		const out = setIn(input, ['user', 'profile', 'name'], 'Bob');

		expect(out).toEqual({ user: { profile: { name: 'Bob' } } });
		expect(input.user.profile.name).toBe('Alice');
		expect(out).not.toBe(input);
		expect((out as typeof input).user).not.toBe(input.user);
	});

	it('should create missing intermediate objects', () => {
		const input = {};
		const out = setIn(input, ['a', 'b', 'c'], 123);

		expect(out).toEqual({ a: { b: { c: 123 } } });
		expect(input).toEqual({});
	});

	it('should set array indexes immutably', () => {
		const input = { list: [{ id: 1 }, { id: 2 }] };
		const out = setIn(input, ['list', 1, 'id'], 99);

		expect(out).toEqual({ list: [{ id: 1 }, { id: 99 }] });
		expect(input.list[1]?.id).toBe(2);
		expect((out as typeof input).list).not.toBe(input.list);
	});

	it('should support negative array indexes', () => {
		const input = { list: ['a', 'b', 'c'] };
		const out = setIn(input, ['list', -1], 'z');

		expect(out).toEqual({ list: ['a', 'b', 'z'] });
		expect(input).toEqual({ list: ['a', 'b', 'c'] });
	});

	it('should support numeric string indexes on arrays', () => {
		const input = { list: ['a', 'b', 'c'] as Array<string> & Record<string, unknown> };
		const out = setIn(input, ['list', '1'], 'x') as typeof input;

		expect(out.list[0]).toBe('a');
		expect(out.list[1]).toBe('x');
		expect(out.list[2]).toBe('c');
		expect(input.list[1]).toBe('b');
	});

	it('should support negative numeric string indexes on arrays', () => {
		const input = { list: ['a', 'b', 'c'] as Array<string> & Record<string, unknown> };
		const out = setIn(input, ['list', '-1'], 'x') as typeof input;

		expect(out.list[0]).toBe('a');
		expect(out.list[1]).toBe('b');
		expect(out.list[2]).toBe('x');
		expect(input.list[2]).toBe('c');
	});

	it('should fall back to object-key behavior for out-of-bounds negative indexes', () => {
		const input = { list: ['a', 'b', 'c'] as Array<string> & Record<string, unknown> };
		const out = setIn(input, ['list', -10], 'x') as typeof input;

		expect(out.list[-10]).toBe('x');
		expect(input.list[-10]).toBeUndefined();
	});

	it('should set Map values immutably', () => {
		const input = new Map<string, { score: number }>([['alice', { score: 10 }]]);
		const out = setIn(input, ['alice', 'score'], 20) as typeof input;

		expect(out).not.toBe(input);
		expect(out.get('alice')?.score).toBe(20);
		expect(input.get('alice')?.score).toBe(10);
	});

	it('should create missing numeric intermediate containers as arrays', () => {
		const input = {};
		const out = setIn(input, ['items', 0, 'name'], 'first') as {
			items: Array<{ name: string }>;
		};

		expect(Array.isArray(out.items)).toBe(true);
		expect(out.items[0]?.name).toBe('first');
		expect(input).toEqual({});
	});

	it('should treat non-integer number keys on arrays as object keys', () => {
		const input = { list: ['a', 'b', 'c'] as Array<string> & Record<string, unknown> };
		const out = setIn(input, ['list', 1.5], 'x') as typeof input;

		expect(out.list[1]).toBe('b');
		expect(out.list[1.5]).toBe('x');
		expect(input.list[1.5]).toBeUndefined();
	});

	it('should create nested containers under missing Map keys', () => {
		const input = new Map<string, unknown>();
		const out = setIn(input, ['meta', 'version'], '1.0.0') as Map<string, unknown>;

		expect((out.get('meta') as { version: string }).version).toBe('1.0.0');
		expect(input.has('meta')).toBe(false);
	});

	it('should replace root when path is empty', () => {
		const input = { a: 1 };
		const out = setIn(input, [], { b: 2 });

		expect(out).toEqual({ b: 2 });
		expect(input).toEqual({ a: 1 });
	});

	it('should update arrays when the array itself is the root value', () => {
		const input = [10, 20, 30] as Array<number> & Record<string, unknown>;
		const out = setIn(input, [1], 99) as typeof input;

		expect(out[0]).toBe(10);
		expect(out[1]).toBe(99);
		expect(out[2]).toBe(30);
		expect(input[1]).toBe(20);
		expect(out).not.toBe(input);
	});

	describe('deeply nested structures with arrays', () => {
		it('should update values in arrays within arrays', () => {
			const input = {
				matrix: [
					[1, 2, 3],
					[4, 5, 6],
					[7, 8, 9],
				],
			};
			const out = setIn(input, ['matrix', 1, 2], 99);

			expect(out).toEqual({
				matrix: [
					[1, 2, 3],
					[4, 5, 99],
					[7, 8, 9],
				],
			});
			expect(input.matrix[1][2]).toBe(6);
			expect(out.matrix).not.toBe(input.matrix);
			expect(out.matrix[1]).not.toBe(input.matrix[1]);
		});

		it('should handle objects nested deep within arrays', () => {
			const input = {
				users: [
					{ id: 1, profile: { name: 'Alice', scores: [10, 20, 30] } },
					{ id: 2, profile: { name: 'Bob', scores: [15, 25, 35] } },
				],
			};
			const out = setIn(input, ['users', 1, 'profile', 'scores', 2], 100);

			expect(out.users[1].profile.scores[2]).toBe(100);
			expect(input.users[1].profile.scores[2]).toBe(35);
			expect(out.users).not.toBe(input.users);
			expect(out.users[1]).not.toBe(input.users[1]);
			expect(out.users[1].profile).not.toBe(input.users[1].profile);
			expect(out.users[1].profile.scores).not.toBe(input.users[1].profile.scores);
		});

		it('should use negative indices in deeply nested arrays', () => {
			const input = {
				data: {
					records: [
						{ items: ['a', 'b', 'c'] },
						{ items: ['x', 'y', 'z'] },
					],
				},
			};
			const out = setIn(input, ['data', 'records', -1, 'items', -1], 'LAST');

			expect(out.data.records[1].items[2]).toBe('LAST');
			expect(input.data.records[1].items[2]).toBe('z');
		});

		it('should create missing deep nested structures with mixed array/object paths', () => {
			const input = {};
			const out = setIn(input, ['level1', 0, 'level2', 'items', 1, 'value'], 'deep') as {
				level1: Array<{ level2: { items: Array<{ value: string }> } }>;
			};

			expect(out.level1[0].level2.items[1].value).toBe('deep');
			expect(Array.isArray(out.level1)).toBe(true);
			expect(Array.isArray(out.level1[0].level2.items)).toBe(true);
			expect(input).toEqual({});
		});

		it('should handle triple-nested arrays', () => {
			const input = {
				cube: [
					[
						[1, 2],
						[3, 4],
					],
					[
						[5, 6],
						[7, 8],
					],
				],
			};
			const out = setIn(input, ['cube', 1, 0, 1], 99);

			expect(out.cube[1][0][1]).toBe(99);
			expect(input.cube[1][0][1]).toBe(6);
			expect(out.cube).not.toBe(input.cube);
			expect(out.cube[1]).not.toBe(input.cube[1]);
			expect(out.cube[1][0]).not.toBe(input.cube[1][0]);
		});

		it('should update deeply nested objects within multiple array layers', () => {
			const input = {
				departments: [
					{
						teams: [
							{ members: [{ name: 'Alice', active: true }] },
							{ members: [{ name: 'Bob', active: false }] },
						],
					},
				],
			};
			const out = setIn(input, ['departments', 0, 'teams', 1, 'members', 0, 'active'], true) as typeof input;

			expect(out.departments[0].teams[1].members[0].active).toBe(true);
			expect(input.departments[0].teams[1].members[0].active).toBe(false);
		});

		it('should preserve unaffected sibling arrays in deep structures', () => {
			const input = {
				root: [
					{ group: [{ val: 1 }, { val: 2 }] },
					{ group: [{ val: 3 }, { val: 4 }] },
				],
			};
			const out = setIn(input, ['root', 0, 'group', 1, 'val'], 99);

			expect(out.root[0].group[1].val).toBe(99);
			expect(out.root[1]).toBe(input.root[1]); // Sibling should be same reference
			expect(out.root[0].group[0]).toBe(input.root[0].group[0]); // Unaffected child
		});

		it('should handle creating arrays at multiple levels when all are missing', () => {
			const input = { container: {} };
			const out = setIn(input, ['container', 'nested', 0, 1, 2], 'value') as {
				container: { nested: Array<Array<Array<string>>> };
			};

			expect(out.container.nested[0][1][2]).toBe('value');
			expect(input.container).toEqual({});
		});

		it('should work with mixed negative and positive indices in deep paths', () => {
			const input = {
				data: [[10, 20, 30], [40, 50, 60], [70, 80, 90]],
			};
			const out = setIn(input, ['data', -1, 1], 888);

			expect(out.data[2][1]).toBe(888);
			expect(input.data[2][1]).toBe(80);
			expect(out.data[0]).toBe(input.data[0]); // Unaffected row
		});

		it('should update deeply nested Maps inside arrays', () => {
			const innerMap = new Map([['key', 'value']]);
			const input = {
				items: [{ data: innerMap }],
			};
			const out = setIn(input, ['items', 0, 'data', 'key'], 'newValue') as typeof input;

			expect(out.items[0].data.get('key')).toBe('newValue');
			expect(input.items[0].data.get('key')).toBe('value');
			expect(out.items[0].data).not.toBe(input.items[0].data);
		});
	});
});
