/**
 * Options for configuring the memoize function.
 */
export type MemoizeOptions<Args extends unknown[]> = {
	/**
	 * Custom function to generate cache keys from function arguments.
	 * If not provided, a safe JSON.stringify is used.
	 * @param args - The arguments passed to the memoized function.
	 * @returns A string key for the cache.
	 */
	keyResolver?: (...args: Args) => string;

	/**
	 * Maximum number of cache entries. When exceeded, the oldest entry is removed.
	 * If not provided, cache size is unlimited.
	 *
	 * @remarks
	 * Eviction uses an **approximate LRU** strategy for performance. Access order is only
	 * updated when the cache is at or above 90 % of `maxSize`. Below that threshold, entries
	 * are evicted in insertion order (FIFO), not true least-recently-used order. This is a
	 * deliberate trade-off: avoid paying the cost of a Map re-insert on every cache hit when
	 * the cache still has plenty of headroom.
	 *
	 * If your workload has a small working set relative to `maxSize` and strict LRU ordering
	 * matters, set `maxSize` closer to the number of distinct argument combinations you expect.
	 */
	maxSize?: number;

	/**
	 * Time in milliseconds after which a cached result expires.
	 * If not provided, cached results never expire.
	 */
	ttl?: number;

	/**
	 * If true, errors thrown by the function will be cached and re-thrown.
	 * If false (default), errors will not be cached and the function will be re-executed on subsequent calls.
	 */
	cacheErrors?: boolean;

	/**
	 * Maximum size in bytes for a single cache entry. Prevents memory bombs.
	 * If not provided, no size limit is enforced.
	 * @default undefined
	 */
	maxEntrySize?: number;

	/**
	 * Enable cache statistics tracking (hits, misses, evictions).
	 * @default false
	 */
	enableStats?: boolean;
};

/**
 * Cache statistics for monitoring performance.
 */
export type CacheStats = {
	hits: number;
	misses: number;
	evictions: number;
	hitRate: number;
};

/**
 * A memoized function with additional cache management methods.
 */
export type MemoizedFunction<Args extends unknown[], ReturnType> = {
	(...args: Args): ReturnType;

	/**
	 * Clears all cached results.
	 */
	clear: () => void;

	/**
	 * Deletes a specific cache entry by key.
	 * @param args - The arguments used to generate the cache key.
	 * @returns true if an entry was deleted, false otherwise.
	 */
	delete: (...args: Args) => boolean;

	/**
	 * Checks if a cache entry exists for the given arguments.
	 * @param args - The arguments to check.
	 * @returns true if a cache entry exists, false otherwise.
	 */
	has: (...args: Args) => boolean;

	/**
	 * Returns the current size of the cache.
	 */
	size: () => number;

	/**
	 * Returns cache statistics if enabled.
	 * @returns Cache statistics or undefined if stats are not enabled.
	 */
	stats?: () => CacheStats;
};

/**
 * Internal structure for cache entries, storing the value, timestamp, and metadata about errors and async results.
 */
export type CacheEntry<T> = {
	value: T;
	timestamp: number;
	isError?: boolean;
	isAsync?: boolean;
};
