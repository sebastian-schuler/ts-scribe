/**
 * Shared concurrency-limited async worker pool used internally by
 * {@link asyncFilter}, {@link asyncMap}, and {@link asyncForEach}.
 *
 * Spawns up to `concurrency` workers that pull the next index from a shared
 * counter, calling `processItem(index)` for each one. Resolves when every
 * item has been processed.
 *
 * @param itemCount   - Total number of items to process.
 * @param concurrency - Maximum number of items to process concurrently.
 * @param processItem - Async callback invoked with the array index of each item.
 *
 * @internal
 */
export async function runAsyncPool(
	itemCount: number,
	concurrency: number,
	processItem: (index: number) => Promise<void>,
): Promise<void> {
	let nextIndex = 0;

	async function worker(): Promise<void> {
		const index = nextIndex++;
		if (index >= itemCount) return;
		await processItem(index);
		return worker();
	}

	const workers = Array.from({ length: Math.min(concurrency, itemCount) }, async () => worker());
	await Promise.all(workers);
}
