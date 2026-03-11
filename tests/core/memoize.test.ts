import { describe, expect, it, jest } from 'bun:test';
import { memoize } from '../../src/core/index.js';

describe('memoize', () => {
	describe('Basic Functionality', () => {
		it('should cache and return the same result for identical arguments', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			expect(memoized(5)).toBe(10);
			expect(memoized(5)).toBe(10);
			expect(memoized(5)).toBe(10);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should call the function again for different arguments', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			expect(memoized(5)).toBe(10);
			expect(memoized(10)).toBe(20);
			expect(memoized(5)).toBe(10);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('should work with multiple arguments', () => {
			const fn = jest.fn((a: number, b: number) => a + b);
			const memoized = memoize(fn);

			expect(memoized(1, 2)).toBe(3);
			expect(memoized(1, 2)).toBe(3);
			expect(memoized(2, 3)).toBe(5);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('should handle zero arguments', () => {
			const fn = jest.fn(() => Math.random());
			const memoized = memoize(fn);

			const result1 = memoized();
			const result2 = memoized();
			expect(result1).toBe(result2);
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe('Async Functions', () => {
		it('should cache async function results', async () => {
			const fn = jest.fn(async (x: number) => {
				await new Promise(resolve => setTimeout(resolve, 10));
				return x * 2;
			});
			const memoized = memoize(fn);

			const result1 = await memoized(5);
			const result2 = await memoized(5);
			const result3 = await memoized(5);

			expect(result1).toBe(10);
			expect(result2).toBe(10);
			expect(result3).toBe(10);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should handle rejected promises correctly', async () => {
			const fn = jest.fn(async (x: number) => {
				await new Promise(resolve => setTimeout(resolve, 10));
				throw new Error(`Error: ${x}`);
			});
			const memoized = memoize(fn);

			await expect(memoized(5)).rejects.toThrow('Error: 5');
			await expect(memoized(5)).rejects.toThrow('Error: 5');
			// Without cacheErrors, it should call the function each time
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('should cache rejected promises when cacheErrors is true', async () => {
			const fn = jest.fn(async (x: number) => {
				await new Promise(resolve => setTimeout(resolve, 10));
				throw new Error(`Error: ${x}`);
			});
			const memoized = memoize(fn, { cacheErrors: true });

			await expect(memoized(5)).rejects.toThrow('Error: 5');
			await expect(memoized(5)).rejects.toThrow('Error: 5');
			await expect(memoized(5)).rejects.toThrow('Error: 5');
			// With cacheErrors, it should only call once
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe('Recursive Functions (Fibonacci)', () => {
		it('should dramatically improve performance for recursive functions', () => {
			const fibonacci = memoize((n: number): number => {
				if (n <= 1) return n;
				return fibonacci(n - 1) + fibonacci(n - 2);
			});

			const result = fibonacci(40);
			expect(result).toBe(102334155);

			// Second call should be instant due to memoization
			const startTime = Date.now();
			const result2 = fibonacci(40);
			const duration = Date.now() - startTime;

			expect(result2).toBe(102334155);
			expect(duration).toBeLessThan(10); // Should be nearly instant
		});

		it('should handle recursive factorial calculation', () => {
			const factorial = memoize((n: number): number => {
				if (n <= 1) return 1;
				return n * factorial(n - 1);
			});

			expect(factorial(5)).toBe(120);
			expect(factorial(10)).toBe(3628800);
			expect(factorial(5)).toBe(120); // Cached result
		});
	});

	describe('TTL (Time To Live)', () => {
		it('should expire cached results after TTL', async () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn, { ttl: 50 }); // 50ms TTL

			expect(memoized(5)).toBe(10);
			expect(fn).toHaveBeenCalledTimes(1);

			// Still cached
			expect(memoized(5)).toBe(10);
			expect(fn).toHaveBeenCalledTimes(1);

			// Wait for TTL to expire
			await new Promise(resolve => setTimeout(resolve, 60));

			// Should call function again
			expect(memoized(5)).toBe(10);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('should check TTL on has() method', async () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn, { ttl: 50 });

			memoized(5);
			expect(memoized.has(5)).toBe(true);

			// Wait for TTL to expire
			await new Promise(resolve => setTimeout(resolve, 60));

			expect(memoized.has(5)).toBe(false);
		});
	});

	describe('Max Size (LRU Eviction)', () => {
		it('should evict least recently used entries when maxSize is exceeded', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn, { maxSize: 3 });

			memoized(1); // Cache: [1]
			memoized(2); // Cache: [1, 2]
			memoized(3); // Cache: [1, 2, 3]
			memoized(4); // Cache: [2, 3, 4] - 1 evicted

			expect(memoized.size()).toBe(3);
			expect(fn).toHaveBeenCalledTimes(4);

			// Accessing 1 should call the function again (it was evicted)
			memoized(1);
			expect(fn).toHaveBeenCalledTimes(5);

			// Accessing 3 should not call the function (it's still cached)
			memoized(3);
			expect(fn).toHaveBeenCalledTimes(5);
		});

		it('should update LRU order on access', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn, { maxSize: 3 });

			memoized(1); // Cache: [1]
			memoized(2); // Cache: [1, 2]
			memoized(3); // Cache: [1, 2, 3]
			memoized(1); // Cache: [2, 3, 1] - 1 accessed, moved to end
			memoized(4); // Cache: [3, 1, 4] - 2 evicted (least recently used)

			expect(memoized.size()).toBe(3);

			// 2 should have been evicted
			memoized(2);
			expect(fn).toHaveBeenCalledTimes(5); // Called for 1,2,3,4,2

			// 1 should still be cached
			memoized(1);
			expect(fn).toHaveBeenCalledTimes(5); // Not called again for 1
		});
	});

	describe('Custom Key Resolver', () => {
		it('should use custom key resolver for cache keys', () => {
			const fn = jest.fn((obj: { id: number; name: string }) => obj.id);
			const memoized = memoize(fn, {
				keyResolver: (obj) => `id:${obj.id}`,
			});

			const obj1 = { id: 1, name: 'Alice' };
			const obj2 = { id: 1, name: 'Bob' }; // Different object, same id

			expect(memoized(obj1)).toBe(1);
			expect(memoized(obj2)).toBe(1); // Should use cached result
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should handle complex arguments with custom resolver', () => {
			type SearchArgs = { query: string; filters: { category: string; minPrice: number } };
			const fn = jest.fn((args: SearchArgs) => `Results for ${args.query}`);
			const memoized = memoize(fn, {
				keyResolver: (args) => `${args.query}:${args.filters.category}:${args.filters.minPrice}`,
			});

			const search1 = { query: 'laptop', filters: { category: 'electronics', minPrice: 500 } };
			const search2 = { query: 'laptop', filters: { category: 'electronics', minPrice: 500 } };

			expect(memoized(search1)).toBe('Results for laptop');
			expect(memoized(search2)).toBe('Results for laptop');
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe('Cache Management', () => {
		it('should clear all cache entries', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			memoized(1);
			memoized(2);
			memoized(3);
			expect(memoized.size()).toBe(3);

			memoized.clear();
			expect(memoized.size()).toBe(0);

			// Should call function again after clear
			memoized(1);
			expect(fn).toHaveBeenCalledTimes(4);
		});

		it('should delete specific cache entries', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			memoized(1);
			memoized(2);
			expect(memoized.size()).toBe(2);

			const deleted = memoized.delete(1);
			expect(deleted).toBe(true);
			expect(memoized.size()).toBe(1);

			// Should call function again for deleted key
			memoized(1);
			expect(fn).toHaveBeenCalledTimes(3);

			// Should not call function for non-deleted key
			memoized(2);
			expect(fn).toHaveBeenCalledTimes(3);
		});

		it('should return false when deleting non-existent key', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			const deleted = memoized.delete(999);
			expect(deleted).toBe(false);
		});

		it('should check if key exists in cache', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			expect(memoized.has(5)).toBe(false);

			memoized(5);
			expect(memoized.has(5)).toBe(true);

			memoized.delete(5);
			expect(memoized.has(5)).toBe(false);
		});

		it('should return correct cache size', () => {
			const fn = jest.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			expect(memoized.size()).toBe(0);

			memoized(1);
			expect(memoized.size()).toBe(1);

			memoized(2);
			memoized(3);
			expect(memoized.size()).toBe(3);

			memoized(1); // Already cached
			expect(memoized.size()).toBe(3);
		});
	});

	describe('Error Handling', () => {
		it('should not cache errors by default', () => {
			let callCount = 0;
			const fn = (x: number) => {
				callCount++;
				if (x < 0) throw new Error('Negative number');
				return x * 2;
			};
			const memoized = memoize(fn);

			expect(() => memoized(-5)).toThrow('Negative number');
			expect(() => memoized(-5)).toThrow('Negative number');
			expect(callCount).toBe(2); // Called twice because errors not cached
		});

		it('should cache errors when cacheErrors is true', () => {
			let callCount = 0;
			const fn = (x: number) => {
				callCount++;
				if (x < 0) throw new Error('Negative number');
				return x * 2;
			};
			const memoized = memoize(fn, { cacheErrors: true });

			expect(() => memoized(-5)).toThrow('Negative number');
			expect(() => memoized(-5)).toThrow('Negative number');
			expect(callCount).toBe(1); // Called once because error is cached
		});
	});

	describe('Edge Cases', () => {
		it('should handle functions that return undefined', () => {
			const fn = jest.fn((_x: number) => undefined);
			const memoized = memoize(fn);

			expect(memoized(5)).toBeUndefined();
			expect(memoized(5)).toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should handle functions that return null', () => {
			const fn = jest.fn((_x: number) => null);
			const memoized = memoize(fn);

			expect(memoized(5)).toBeNull();
			expect(memoized(5)).toBeNull();
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should handle non-serializable arguments with default key resolver', () => {
			const symbol = Symbol('test');
			const fn = jest.fn((x: symbol) => String(x));
			const memoized = memoize(fn);

			const result1 = memoized(symbol);
			const result2 = memoized(symbol);
			expect(result1).toBe(result2);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should work with array arguments', () => {
			const fn = jest.fn((arr: number[]) => arr.reduce((a, b) => a + b, 0));
			const memoized = memoize(fn);

			expect(memoized([1, 2, 3])).toBe(6);
			expect(memoized([1, 2, 3])).toBe(6);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should work with object arguments', () => {
			const fn = jest.fn((obj: { a: number; b: number }) => obj.a + obj.b);
			const memoized = memoize(fn);

			expect(memoized({ a: 1, b: 2 })).toBe(3);
			expect(memoized({ a: 1, b: 2 })).toBe(3);
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe('Real-world Use Cases', () => {
		it('should optimize expensive data transformations', () => {
			const expensiveTransform = jest.fn((data: number[]) => {
				// Simulate expensive computation
				let result = 0;
				for (const num of data) {
					result += num ** 2;
				}

				return result;
			});

			const memoized = memoize(expensiveTransform);

			const data = [1, 2, 3, 4, 5];
			expect(memoized(data)).toBe(55);
			expect(memoized(data)).toBe(55);
			expect(memoized(data)).toBe(55);
			expect(expensiveTransform).toHaveBeenCalledTimes(1);
		});

		it('should cache API responses with TTL', async () => {
			const fetchUser = jest.fn(async (id: string) => {
				await new Promise(resolve => setTimeout(resolve, 10));
				return { id, name: `User ${id}` };
			});

			const memoized = memoize(fetchUser, { ttl: 100, maxSize: 10 });

			const user1 = await memoized('123');
			const user2 = await memoized('123');
			expect(user1).toEqual(user2);
			expect(fetchUser).toHaveBeenCalledTimes(1);

			// Wait for TTL to expire
			await new Promise(resolve => setTimeout(resolve, 110));

			await memoized('123');
			expect(fetchUser).toHaveBeenCalledTimes(2);
		});
	});

	describe('Security & Performance Improvements', () => {
		describe('Cache Statistics', () => {
			it('should track hits and misses when enabled', () => {
				const fn = jest.fn((x: number) => x * 2);
				const memoized = memoize(fn, { enableStats: true });

				// First call - miss
				memoized(5);
				const stats1 = memoized.stats!();
				expect(stats1.hits).toBe(0);
				expect(stats1.misses).toBe(1);
				expect(stats1.evictions).toBe(0);

				// Second call - hit
				memoized(5);
				const stats2 = memoized.stats!();
				expect(stats2.hits).toBe(1);
				expect(stats2.misses).toBe(1);
				expect(stats2.hitRate).toBe(0.5);

				// Third call - hit
				memoized(5);
				const stats3 = memoized.stats!();
				expect(stats3.hits).toBe(2);
				expect(stats3.misses).toBe(1);
				expect(stats3.hitRate).toBeCloseTo(0.667, 2);
			});

			it('should track evictions when maxSize is exceeded', () => {
				const fn = jest.fn((x: number) => x * 2);
				const memoized = memoize(fn, { maxSize: 2, enableStats: true });

				memoized(1);
				memoized(2);
				memoized(3); // Should evict 1

				const stats = memoized.stats!();
				expect(stats.evictions).toBe(1);
			});

			it('should reset stats when cache is cleared', () => {
				const fn = jest.fn((x: number) => x * 2);
				const memoized = memoize(fn, { enableStats: true });

				memoized(5);
				memoized(5);
				memoized(10);

				expect(memoized.stats!().hits).toBe(1);
				expect(memoized.stats!().misses).toBe(2);

				memoized.clear();

				const stats = memoized.stats!();
				expect(stats.hits).toBe(0);
				expect(stats.misses).toBe(0);
				expect(stats.evictions).toBe(0);
			});

			it('should not have stats method when disabled', () => {
				const fn = jest.fn((x: number) => x * 2);
				const memoized = memoize(fn);

				expect(memoized.stats).toBeUndefined();
			});
		});

		describe('Max Entry Size Protection', () => {
			it('should not cache entries exceeding maxEntrySize', () => {
				const fn = jest.fn((x: string) => x);
				const memoized = memoize(fn, { maxEntrySize: 50 }); // 50 bytes

				const smallString = 'small';
				const largeString = 'a'.repeat(100); // > 50 bytes

				// Small string should be cached
				memoized(smallString);
				memoized(smallString);
				expect(fn).toHaveBeenCalledTimes(1);

				// Large string should not be cached
				memoized(largeString);
				memoized(largeString);
				expect(fn).toHaveBeenCalledTimes(3); // Called twice for large string
			});

			it('should not cache large async results', async () => {
				const fn = jest.fn(async (size: number) => {
					await new Promise(resolve => setTimeout(resolve, 10));
					return 'x'.repeat(size);
				});

				const memoized = memoize(fn, { maxEntrySize: 50 });

				// Small result should be cached
				await memoized(10);
				await memoized(10);
				expect(fn).toHaveBeenCalledTimes(1);

				// Large result should not be cached
				await memoized(100);
				await memoized(100);
				expect(fn).toHaveBeenCalledTimes(3);
			});

			it('should not cache large errors', async () => {
				const fn = jest.fn(async (throwLarge: boolean) => {
					if (throwLarge) {
						const error = new Error('x'.repeat(100));
						throw error;
					}

					return 'ok';
				});

				const memoized = memoize(fn, { cacheErrors: true, maxEntrySize: 50 });

				// Large error should not be cached
				await expect(memoized(true)).rejects.toThrow();
				await expect(memoized(true)).rejects.toThrow();
				expect(fn).toHaveBeenCalledTimes(2); // Called twice, not cached
			});
		});

		describe('Safe Key Resolver', () => {
			it('should handle circular references safely', () => {
				const fn = jest.fn((obj: unknown) => 'result');
				const memoized = memoize(fn);

				const circular: Record<string, unknown> = { a: 1 };
				circular.self = circular;

				// Should not throw, should handle gracefully
				expect(() => memoized(circular)).not.toThrow();
				expect(() => memoized(circular)).not.toThrow();
				expect(fn).toHaveBeenCalledTimes(1);
			});

			it('should prevent prototype pollution in keys', () => {
				const fn = jest.fn((obj: unknown) => 'result');
				const memoized = memoize(fn);

				const dangerous1 = { __proto__: { polluted: true }, value: 1 };
				const dangerous2 = { constructor: 'bad', value: 2 };
				const dangerous3 = { prototype: 'evil', value: 3 };

				// These should work without pollution
				memoized(dangerous1);
				memoized(dangerous2);
				memoized(dangerous3);

				expect(fn).toHaveBeenCalledTimes(3);
			});

			it('should handle deeply nested objects without stack overflow', () => {
				const fn = jest.fn((obj: unknown) => 'result');
				const memoized = memoize(fn);

				// Create a deeply nested object (100 levels)
				let deep: Record<string, unknown> = { value: 'end' };
				for (let i = 0; i < 100; i++) {
					deep = { nested: deep };
				}

				// Should not throw stack overflow
				expect(() => memoized(deep)).not.toThrow();
				expect(() => memoized(deep)).not.toThrow();
				expect(fn).toHaveBeenCalledTimes(1);
			});

			it('should handle various special types safely', () => {
				const fn = jest.fn((x: unknown) => 'result');
				const memoized = memoize(fn);

				const symbol = Symbol('test');
				const bigint = BigInt(123);
				const func = () => 'test';
				const nullValue = null;
				const undef = undefined;

				memoized(symbol);
				memoized(bigint);
				memoized(func);
				memoized(nullValue);
				memoized(undef);

				// Each unique value should call the function once
				expect(fn).toHaveBeenCalledTimes(5);

				// Calling again with same values should use cache
				memoized(bigint);
				memoized(nullValue);
				expect(fn).toHaveBeenCalledTimes(5);
			});
		});

		describe('Optimized LRU Updates', () => {
			it('should not update LRU on every access when cache is small', () => {
				const fn = jest.fn((x: number) => x * 2);
				const memoized = memoize(fn, { maxSize: 100 });

				// Add only a few items (10% of capacity)
				for (let i = 0; i < 10; i++) {
					memoized(i);
				}

				// Access first item multiple times
				// Since cache is only 10% full, LRU shouldn't be updated
				const result1 = memoized(0);
				const result2 = memoized(0);

				expect(result1).toBe(0);
				expect(result2).toBe(0);
				expect(fn).toHaveBeenCalledTimes(10); // Only initial calls
			});

			it('should update LRU when cache is near capacity', () => {
				const fn = jest.fn((x: number) => x * 2);
				const memoized = memoize(fn, { maxSize: 10 });

				// Fill cache to 90%+ capacity
				for (let i = 0; i < 10; i++) {
					memoized(i);
				}

				// Access first item to move it to end
				memoized(0);

				// Add more items to trigger eviction
				memoized(10); // Should evict item 1 (not 0, since 0 was accessed)
				memoized(11); // Should evict item 2

				// Item 0 should still be cached
				const result = memoized(0);
				expect(result).toBe(0);
				expect(fn).toHaveBeenCalledTimes(12); // 0-11 initial, not called again for 0

				// But items 1 and 2 should have been evicted
				memoized(1);
				memoized(2);
				expect(fn).toHaveBeenCalledTimes(14); // Called again for 1 and 2
			});
		});

		describe('Integration - Multiple Improvements', () => {
			it('should work with all features combined', async () => {
				const fn = jest.fn(async (x: number) => {
					await new Promise(resolve => setTimeout(resolve, 10));
					return 'x'.repeat(x);
				});

				const memoized = memoize(fn, {
					maxSize: 5,
					ttl: 200,
					maxEntrySize: 150, // 75 chars * 2 bytes = 150 bytes
					enableStats: true,
					cacheErrors: true,
				});

				// Normal operations (10 chars = 20 bytes, 20 chars = 40 bytes)
				await memoized(10); // Call 1, cached (size = 1)
				await memoized(10); // Hit - cached
				await memoized(20); // Call 2, cached (size = 2)

				const stats1 = memoized.stats!();
				expect(stats1.hits).toBe(1);
				expect(stats1.misses).toBe(2);

				// Large entry shouldn't be cached (200 chars * 2 bytes = 400 bytes > 150)
				await memoized(200); // Call 3, not cached
				await memoized(200); // Call 4, not cached
				expect(fn).toHaveBeenCalledTimes(4);

				// Fill up cache to test eviction (30, 40, 50 chars all < 75 char limit)
				await memoized(30); // Call 5, cached (size = 3)
				await memoized(40); // Call 6, cached (size = 4)
				await memoized(50); // Call 7, cached (size = 5)
				await memoized(60); // Call 8, cached - triggers eviction (size = 5 after eviction)

				expect(fn).toHaveBeenCalledTimes(8);

				const stats2 = memoized.stats!();
				expect(stats2.evictions).toBeGreaterThan(0);
				expect(stats2.evictions).toBe(1); // One item evicted (10)

				// Verify 10 was evicted
				await memoized(10); // Call 9 - should call function again
				expect(fn).toHaveBeenCalledTimes(9);
			});
		});
	});
});

