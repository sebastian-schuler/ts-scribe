import { estimateSize } from './estimate-size.js';
import { memoizeSafeStringify } from './memoize-safe-stringify.js';
import { type CacheEntry, type CacheStats, type MemoizedFunction, type MemoizeOptions } from './types.js';

/**
 * Creates a memoized version of a function that caches its results based on arguments.
 * Supports both synchronous and asynchronous functions with advanced features like TTL,
 * maximum cache size with LRU eviction, and custom key resolution.
 *
 * ---
 * Example:
 * ```ts
 * // Simple memoization for expensive computation
 * const fibonacci = memoize((n: number): number => {
 *   if (n <= 1) return n;
 *   return fibonacci(n - 1) + fibonacci(n - 2);
 * });
 *
 * // With TTL and max size
 * const fetchUser = memoize(
 *   async (id: string) => {
 *     const response = await fetch(`/api/users/${id}`);
 *     return response.json();
 *   },
 *   { ttl: 60000, maxSize: 100 } // Cache for 1 minute, max 100 entries
 * );
 *
 * // With custom key resolver
 * const searchProducts = memoize(
 *   (query: string, filters: object) => performSearch(query, filters),
 *   { keyResolver: (query, filters) => `${query}-${JSON.stringify(filters)}` }
 * );
 *
 * // Cache management
 * fetchUser.clear(); // Clear all cache
 * fetchUser.delete('user-123'); // Delete specific cache entry
 * console.log(fetchUser.size()); // Get cache size
 * ```
 *
 * @category Core
 * @param fn - The function to memoize. Can be synchronous or asynchronous.
 * @param options - Configuration options for memoization behavior.
 * @returns A memoized version of the function with cache management methods.
 *
 * @example
 * // Fibonacci with memoization
 * const fib = memoize((n: number): number => {
 *   if (n <= 1) return n;
 *   return fib(n - 1) + fib(n - 2);
 * });
 * console.log(fib(40)); // Fast due to memoization
 *
 * @example
 * // API call with TTL
 * const getUser = memoize(
 *   async (id: string) => {
 *     const res = await fetch(`/api/users/${id}`);
 *     return res.json();
 *   },
 *   { ttl: 5000 } // Cache for 5 seconds
 * );
 */
export function memoize<Args extends unknown[], ReturnType>(
	fn: (...args: Args) => ReturnType,
	options: MemoizeOptions<Args> = {},
): MemoizedFunction<Args, ReturnType> {
	const {
		keyResolver = defaultKeyResolver,
		maxSize,
		ttl,
		cacheErrors = false,
		maxEntrySize,
		enableStats = false,
	} = options;

	// Use Map to maintain insertion order for LRU
	const cache = new Map<string, CacheEntry<ReturnType>>();

	// Cache statistics
	const stats = enableStats
		? {
				hits: 0,
				misses: 0,
				evictions: 0,
			}
		: undefined;

	/**
	 * Check if a cache entry is still valid based on TTL
	 */
	function isValid(entry: CacheEntry<ReturnType>): boolean {
		if (!ttl) {
			return true;
		}

		return Date.now() - entry.timestamp < ttl;
	}

	/**
	 * Evict the least recently used (oldest) entry when maxSize is exceeded
	 */
	function evictLru(): void {
		if (!maxSize || cache.size < maxSize) {
			return;
		}

		// Get the first (oldest) key and delete it
		const firstKey = cache.keys().next().value;
		if (firstKey !== undefined) {
			cache.delete(firstKey);
			if (stats) {
				stats.evictions++;
			}
		}
	}

	/**
	 * Approximate LRU: re-insert the accessed entry so it sits at the Map tail
	 * (most-recently-used position). Skipped when the cache is below 90 % of
	 * maxSize to avoid the overhead of a delete+set on every hit.
	 */
	function updateLru(key: string, entry: CacheEntry<ReturnType>): void {
		if (maxSize && cache.size >= maxSize * 0.9) {
			cache.delete(key);
			cache.set(key, entry);
		}
	}

	/**
	 * Check if a value exceeds the maximum entry size.
	 */
	function exceedsMaxSize(value: unknown): boolean {
		if (!maxEntrySize) return false;
		return estimateSize(value) > maxEntrySize;
	}

	const memoized = function (...args: Args): ReturnType {
		const key = keyResolver(...args);

		// Check if we have a cached result
		if (cache.has(key)) {
			const entry = cache.get(key)!;

			// Check if the cached entry is still valid
			if (isValid(entry)) {
				// Update LRU order (optimized - only when near capacity)
				updateLru(key, entry);

				// Track cache hit
				if (stats) {
					stats.hits++;
				}

				// If it's a cached error, handle appropriately
				if (entry.isError) {
					// If it came from an async function, return a rejected Promise
					if (entry.isAsync) {
						// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
						return Promise.reject(entry.value) as ReturnType;
					}

					// Otherwise, throw synchronously
					// eslint-disable-next-line @typescript-eslint/only-throw-error
					throw entry.value;
				}

				return entry.value;
			}

			// Entry expired, remove it
			cache.delete(key);
		}

		// Track cache miss
		if (stats) {
			stats.misses++;
		}

		// Execute the function
		try {
			const result = fn(...args);

			// Handle Promise results (async functions)
			if (result instanceof Promise) {
				// eslint-disable-next-line promise/prefer-await-to-then, promise/prefer-catch
				return result.then(
					(resolvedValue) => {
						// Check if value exceeds max entry size
						if (!exceedsMaxSize(resolvedValue)) {
							// Cache the successful result
							evictLru();
							cache.set(key, {
								value: resolvedValue as ReturnType,
								timestamp: Date.now(),
								isError: false,
								isAsync: true,
							});
						}

						return resolvedValue as ReturnType;
					},
					(error: unknown) => {
						// Cache errors if configured to do so
						if (cacheErrors && !exceedsMaxSize(error)) {
							evictLru();
							cache.set(key, {
								value: error as ReturnType,
								timestamp: Date.now(),
								isError: true,
								isAsync: true,
							});
						}

						throw error;
					},
				) as ReturnType;
			}

			// Cache synchronous results (if not too large)
			if (!exceedsMaxSize(result)) {
				evictLru();
				cache.set(key, {
					value: result,
					timestamp: Date.now(),
					isError: false,
					isAsync: false,
				});
			}

			return result;
		} catch (error) {
			// Cache errors if configured to do so (and not too large)
			if (cacheErrors && !exceedsMaxSize(error)) {
				evictLru();
				cache.set(key, {
					value: error as ReturnType,
					timestamp: Date.now(),
					isError: true,
					isAsync: false,
				});
			}

			throw error;
		}
	};

	// Add cache management methods
	memoized.clear = () => {
		cache.clear();
		if (stats) {
			stats.hits = 0;
			stats.misses = 0;
			stats.evictions = 0;
		}
	};

	memoized.delete = (...args: Args): boolean => {
		const key = keyResolver(...args);
		return cache.delete(key);
	};

	memoized.has = (...args: Args): boolean => {
		const key = keyResolver(...args);
		if (!cache.has(key)) {
			return false;
		}

		const entry = cache.get(key)!;
		if (!isValid(entry)) {
			cache.delete(key);
			return false;
		}

		return true;
	};

	memoized.size = (): number => {
		return cache.size;
	};

	// Add stats method if enabled
	if (enableStats && stats) {
		memoized.stats = (): CacheStats => {
			const total = stats.hits + stats.misses;
			const hitRate = total > 0 ? stats.hits / total : 0;

			return {
				hits: stats.hits,
				misses: stats.misses,
				evictions: stats.evictions,
				hitRate,
			};
		};
	}

	return memoized;
}

/**
 * Default key resolver that uses safe JSON.stringify.
 * Protects against circular references, deeply nested objects, and prototype pollution.
 */
function defaultKeyResolver(...args: unknown[]): string {
	try {
		return memoizeSafeStringify(args);
	} catch {
		// Ultimate fallback for non-serializable arguments
		return args.map(String).join('|');
	}
}
