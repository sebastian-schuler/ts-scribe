/**
 * A safe version of JSON.stringify that handles circular references and limits depth.
 * This is a simplified implementation of safe stringification, designed for memoization caching.
 *
 * @param value - The value to stringify.
 * @param maxDepth - Maximum depth to traverse objects (default: 10).
 */
export function memoizeSafeStringify(value: unknown, maxDepth = 10): string {
	const seen = new WeakSet();

	const stringify = (value_: unknown, depth: number): string => {
		if (depth > maxDepth) {
			return '[Max Depth]';
		}

		if (value_ === null) return 'null';
		if (value_ === undefined) return 'undefined';

		const type = typeof value_;
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		if (type === 'string') return `"${String(value_)}"`;
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		if (type === 'number' || type === 'boolean') return String(value_);
		if (type === 'function') return '[Function]';
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		if (type === 'symbol') return String(value_);
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		if (type === 'bigint') return `${String(value_)}n`;

		if (typeof value_ === 'object') {
			if (seen.has(value_)) {
				return '[Circular]';
			}

			seen.add(value_);

			if (Array.isArray(value_)) {
				const items = value_.map((item) => stringify(item, depth + 1));
				return `[${items.join(',')}]`;
			}

			const pairs: string[] = [];
			for (const key in value_) {
				if (Object.hasOwn(value_, key)) {
					// Sanitize keys to prevent prototype pollution
					if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
						continue;
					}

					const value = (value_ as Record<string, unknown>)[key];
					pairs.push(`"${key}":${stringify(value, depth + 1)}`);
				}
			}

			return `{${pairs.join(',')}}`;
		}

		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		return String(value_);
	};

	return stringify(value, 0);
}
