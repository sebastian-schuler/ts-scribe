/**
 * Estimates the size of a value in bytes (rough approximation).
 */
export function estimateSize(value: unknown): number {
	const type = typeof value;

	if (value === null || value === undefined) return 0;
	if (type === 'boolean') return 4;
	if (type === 'number') return 8;
	if (type === 'string') return (value as string).length * 2; // UTF-16
	if (type === 'bigint') return 8;

	if (typeof value === 'object') {
		// Special handling for Error objects
		if (value instanceof Error) {
			let size = 0;
			if (value.message) size += value.message.length * 2;
			if (value.stack) size += value.stack.length * 2;
			return size;
		}

		try {
			// Rough estimate using JSON.stringify length
			return JSON.stringify(value).length * 2;
		} catch {
			return 1024; // Default estimate for non-serializable objects
		}
	}

	return 0;
}
