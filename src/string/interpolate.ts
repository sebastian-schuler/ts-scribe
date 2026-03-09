type InterpolateOptions = {
	/**
	 * Opening delimiter for placeholders.
	 * @default '{'
	 */
	open?: string;

	/**
	 * Closing delimiter for placeholders.
	 * @default '}'
	 */
	close?: string;

	/**
	 * Fallback value for placeholders whose key is not found in `data`.
	 * - If a `string`, it is used as the literal replacement.
	 * - If a `function`, it is called with the missing key and its return value is used.
	 * - If `undefined` (default), the original placeholder is kept verbatim.
	 *
	 * Ignored when `strict` is `true`.
	 */
	fallback?: string | ((key: string) => string);

	/**
	 * When `true`, throws a `RangeError` if a placeholder key cannot be resolved from `data`.
	 * Takes precedence over `fallback`.
	 * @default false
	 */
	strict?: boolean;

	/**
	 * Optional transformation applied to every resolved value just before it is
	 * substituted into the template. Receives the raw value and the placeholder key.
	 * The return value is used as the final string fragment.
	 * @default String
	 */
	transform?: (value: unknown, key: string) => string;
};

/** Strips leading and trailing spaces from a string type. */
type Trim<T extends string> = T extends ` ${infer R}` ? Trim<R> : T extends `${infer L} ` ? Trim<L> : T;

/** Union of all placeholder key names found in template `T`. */
type ExtractKeys<T extends string> = T extends `${string}{${infer Key}}${infer Rest}`
	? Trim<Key> | ExtractKeys<Rest>
	: never;

/**
 * Filters out dot-path keys (e.g. `user.name`) since they cannot be expressed as
 * top-level object keys for static type-checking purposes.
 */
type TopLevelKey<K extends string> = K extends `${string}.${string}` ? never : K;

/**
 * The expected `data` type for a given template `T`.
 * - Simple placeholder keys (e.g. `{name}`) are inferred as optional properties.
 * - Dot-path keys (e.g. `{user.name}`) and positional indices (`{0}`) fall back to
 *   `Record<string, unknown>` / `unknown[]` since they can only be resolved at runtime.
 * - When no keys can be inferred, any record or array is accepted.
 *
 * Note: keys are intentionally optional so the function compiles correctly when used
 * with a `fallback` or in `strict` mode with deliberately missing keys.
 */
type InterpolateData<T extends string> = [TopLevelKey<ExtractKeys<T>>] extends [never]
	? Record<string, unknown> | unknown[]
	: Partial<Record<TopLevelKey<ExtractKeys<T>>, unknown>> | unknown[];

function escapeRegex(s: string): string {
	return s.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
}

function resolveDotPath(object: Record<string, unknown>, path: string): unknown {
	let current: unknown = object;

	for (const segment of path.split('.')) {
		if (current === null || typeof current !== 'object') return undefined;
		current = (current as Record<string, unknown>)[segment];
	}

	return current;
}

function valueToString(value: NonNullable<unknown>): string {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
		return String(value);
	}

	if (typeof value === 'symbol') {
		return value.description ?? value.toString();
	}

	return JSON.stringify(value) ?? '';
}

/**
 * Interpolates a template string by replacing `{key}` placeholders with values
 * from a data object or array.
 *
 * **Named placeholders** resolve keys against a plain object, with support for
 * dot-notation paths to access nested properties.
 * **Positional placeholders** (`{0}`, `{1}`, …) resolve numeric indices against
 * an array.
 *
 * @category String
 * @template T - The template string literal type (enables key inference).
 * @param {string | undefined} template - The template string containing placeholders.
 * @param {Record<string, unknown> | unknown[]} data - Values to substitute into the template.
 * @param {InterpolateOptions} [options] - Optional configuration.
 * @returns {string} The interpolated string.
 *
 * @throws {Error} If `open` or `close` delimiters are empty strings.
 * @throws {RangeError} If `strict` is `true` and a placeholder key is not found in `data`.
 *
 * @example
 * // Named placeholder
 * interpolateString('Hello, {name}!', { name: 'Alice' });
 * // Returns "Hello, Alice!"
 *
 * @example
 * // Nested dot-notation path
 * interpolateString('Welcome, {user.profile.displayName}.', {
 *   user: { profile: { displayName: 'Bob' } },
 * });
 * // Returns "Welcome, Bob."
 *
 * @example
 * // Positional (array) placeholders
 * interpolateString('{0} + {1} = {2}', [1, 2, 3]);
 * // Returns "1 + 2 = 3"
 *
 * @example
 * // Custom delimiters
 * interpolateString('Hello, {{name}}!' as string, { name: 'Carol' }, { open: '{{', close: '}}' });
 * // Returns "Hello, Carol!"
 *
 * @example
 * // Fallback for missing keys
 * interpolateString('Hi {firstName} {lastName}!', { firstName: 'Dave' }, { fallback: '?' });
 * // Returns "Hi Dave ?!"
 *
 * @example
 * // Fallback function
 * interpolateString('Hi {firstName} {lastName}!', { firstName: 'Eve' }, {
 *   fallback: (key) => `<missing:${key}>`,
 * });
 * // Returns "Hi Eve <missing:lastName>!"
 *
 * @example
 * // Strict mode – throws on missing keys
 * interpolateString('Hi {name}!' as string, {}, { strict: true });
 * // Throws: RangeError: Missing interpolation key: "name"
 *
 * @example
 * // Value transformer
 * interpolateString('Today is {date}.', { date: new Date('2026-01-01') }, {
 *   transform: (value) => (value as Date).toLocaleDateString('en-US'),
 * });
 * // Returns "Today is 1/1/2026."
 */
export function interpolateString<T extends string>(
	template: T | undefined,
	data: InterpolateData<T>,
	options?: InterpolateOptions,
): string {
	if (!template) return '';

	const { open = '{', close = '}', fallback, strict = false, transform } = options ?? {};

	if (!open || !close) {
		throw new Error('Interpolation delimiters must be non-empty strings.');
	}

	const pattern = new RegExp(`${escapeRegex(open)}([\\s\\S]+?)${escapeRegex(close)}`, 'g');

	return template.replaceAll(pattern, (match, rawKey: string) => {
		const key = rawKey.trim();
		let value: unknown;

		if (Array.isArray(data)) {
			const index = Number(key);
			value = Number.isInteger(index) && index >= 0 && index < data.length ? data[index] : undefined;
		} else {
			value = resolveDotPath(data as Record<string, unknown>, key);
		}

		if (value === undefined || value === null) {
			if (strict) throw new RangeError(`Missing interpolation key: "${key}"`);
			if (fallback !== undefined) return typeof fallback === 'function' ? fallback(key) : fallback;

			return match;
		}

		return transform ? transform(value, key) : valueToString(value);
	});
}
