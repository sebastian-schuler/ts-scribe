/* eslint-disable n/prefer-global/buffer */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { safeJsonStringify } from './safe-json-stringify.js';

/**
 * Controls the accuracy/speed trade-off of {@link jsonByteSize}.
 *
 * | Level | Method | Memory | Circular references | Throwing getters | `toJSON()` |
 * |---|---|---|---|---|---|
 * | `'exact'` | Full serialization via {@link safeJsonStringify} | O(n) | `[Circular]` placeholder | `[Throws: …]` placeholder | ✓ |
 * | `'fast'` | Recursive walk — exact UTF-8 bytes + escape overhead | O(depth) | ⚠ Stack overflow | Key skipped | ✓ |
 * | `'estimate'` | Recursive walk — character count only | O(depth) | ⚠ Stack overflow | Key skipped | ✗ |
 *
 * @see {@link jsonByteSize}
 * @category Core
 */
export type JsonByteSizeAccuracy = 'exact' | 'fast' | 'estimate';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Counts the extra bytes added by JSON string-escaping on top of raw UTF-8 byte counts.
 * Characters that are escaped in JSON are longer in their serialized form:
 * - `"` and `\` → 2 bytes (+1)
 * - `\b`, `\t`, `\n`, `\f`, `\r` → 2 bytes (+1)
 * - Other control chars U+0000–U+001F → `\uXXXX` sequence, 6 bytes (+5)
 */
function jsonEscapeOverhead(string_: string): number {
	let overhead = 0;
	for (let i = 0; i < string_.length; i++) {
		// eslint-disable-next-line unicorn/prefer-code-point
		const code = string_.charCodeAt(i);
		if (code === 0x22 || code === 0x5c) {
			overhead += 1; // `"` or `\` → `\"` or `\\`
		} else if (code === 0x08 || code === 0x09 || code === 0x0a || code === 0x0c || code === 0x0d) {
			overhead += 1; // `\b` `\t` `\n` `\f` `\r` → two-char escape sequence
		} else if (code < 0x20) {
			overhead += 5; // Other control chars → `\uXXXX` (1 raw byte → 6 JSON bytes)
		}
	}

	return overhead;
}

/**
 * Shared recursive walker used by `'fast'` and `'estimate'` modes.
 *
 * @param measureString - Returns the byte count for the *contents* of a JSON string (excluding quotes).
 * @param callToJson - Whether to invoke `toJSON()` on objects that define it.
 */
function approximateWalk(value: unknown, measureString: (s: string) => number, callToJson: boolean): number {
	if (value === null) return 4; // 'null'

	switch (typeof value) {
		case 'boolean': {
			return value ? 4 : 5; // 'true' or 'false'
		}

		case 'number': {
			if (!Number.isFinite(value)) return 4; // NaN, ±Infinity → 'null'
			// -0 serializes as '0' in JSON
			return Object.is(value, -0) ? 1 : String(value).length;
		}

		case 'string': {
			return measureString(value) + 2; // +2 for surrounding quotes
		}

		case 'undefined':
		case 'function':
		case 'symbol': {
			return 4; // Top-level non-serializable → 'null' (mirroring safeJsonStringify)
		}

		case 'bigint': {
			// Mirror safeJsonStringify: BigInt values become a quoted "[BigInt: N]" string
			const placeholder = `[BigInt: ${value.toString()}]`;
			return measureString(placeholder) + 2;
		}

		case 'object': {
			return approximateWalkObject(value, measureString, callToJson);
		}
	}

	// Unreachable — typeof covers all possible types, but TypeScript cannot prove it
	return 4;
}

function approximateWalkObject(value: object, measureString: (s: string) => number, callToJson: boolean): number {
	if (Array.isArray(value)) {
		if (value.length === 0) return 2; // '[]'
		let size = 2; // Array brackets
		let first = true;
		for (const item of value) {
			if (!first) size += 1; // Comma separator
			first = false;
			// Undefined, functions, and symbols in arrays serialize as null
			size +=
				item === undefined || typeof item === 'function' || typeof item === 'symbol'
					? 4
					: approximateWalk(item, measureString, callToJson);
		}

		return size;
	}

	// Call toJSON() if enabled (e.g. Date → ISO string)
	if (callToJson && typeof (value as any).toJSON === 'function') {
		try {
			return approximateWalk((value as any).toJSON(), measureString, callToJson);
		} catch {
			// Ignore throwing toJSON and fall through to plain-object handling
		}
	}

	// Plain object: iterate own enumerable string keys (mirrors JSON.stringify)
	let size = 2; // Object braces
	let first = true;
	for (const key of Object.keys(value)) {
		let propValue: unknown;
		try {
			propValue = (value as Record<string, unknown>)[key];
		} catch {
			continue; // Skip keys with throwing getters
		}

		// Undefined, function, and symbol values are omitted (like JSON.stringify)
		if (propValue === undefined || typeof propValue === 'function' || typeof propValue === 'symbol') continue;
		if (!first) size += 1; // Comma separator
		first = false;
		// "key": → measured key bytes + 2 quotes + 1 colon
		size += measureString(key) + 3;
		size += approximateWalk(propValue, measureString, callToJson);
	}

	return size;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the UTF-8 byte size of a value as it would appear when JSON-serialized.
 *
 * The `accuracy` parameter controls the precision/speed trade-off:
 * - **`'exact'`** *(default)* — Serializes the value via {@link safeJsonStringify} and measures
 *   the resulting string. Handles every edge case (circular references, throwing getters,
 *   `toJSON()`, `BigInt`, etc.) at the cost of O(n) memory for the intermediate JSON string.
 * - **`'fast'`** — Recursive walk using real UTF-8 byte counts plus JSON escape overhead.
 *   Calls `toJSON()` and skips throwing getters. Does **not** protect against circular references.
 * - **`'estimate'`** — Like `'fast'` but uses character count (`string.length`) instead of
 *   UTF-8 byte counts, and does not call `toJSON()`. Fastest option but may undercount
 *   multi-byte Unicode strings or strings with many escape sequences.
 *
 * @category Core
 * @param {unknown} value - Any value to measure. Primitives, objects, arrays, `null`, and `undefined` are all accepted.
 * @param {JsonByteSizeAccuracy} [accuracy] - Controls the precision/speed trade-off. Defaults to `'exact'`.
 * @returns {number} The UTF-8 byte length of the JSON-serialized value.
 *
 * @example
 * // Basic usage — measures the exact byte size of a serialized object
 * jsonByteSize({ name: 'Alice', age: 30 }); // Returns 22
 *
 * @example
 * // Fast mode — same result for ASCII data, avoids allocating the full JSON string
 * jsonByteSize({ name: 'Alice', age: 30 }, 'fast'); // Returns 22
 *
 * @example
 * // Multi-byte Unicode — 'exact' and 'fast' agree, 'estimate' undercounts
 * jsonByteSize('🎉', 'exact');    // Returns 6 (2 quotes + 4 UTF-8 bytes)
 * jsonByteSize('🎉', 'fast');     // Returns 6
 * jsonByteSize('🎉', 'estimate'); // Returns 4 (undercounts — emoji is 2 JS chars but 4 UTF-8 bytes)
 *
 * @example
 * // Payload size guard — 'fast' avoids allocating a full JSON string
 * const MAX_BYTES = 1024 * 256; // 256 KB
 * if (jsonByteSize(payload, 'fast') > MAX_BYTES) {
 *   throw new Error('Payload too large');
 * }
 */
export function jsonByteSize(value: unknown, accuracy: JsonByteSizeAccuracy = 'exact'): number {
	if (accuracy === 'exact') {
		// SafeJsonStringify returns undefined at runtime for values JSON.stringify cannot serialize
		// at the top level (undefined, functions, symbols). Mirror JSON's object-value coercion: treat as null.
		const json = (safeJsonStringify(value) as string | undefined) ?? 'null';
		return Buffer.byteLength(json, 'utf8');
	}

	if (accuracy === 'fast') {
		const measureString = (s: string) => Buffer.byteLength(s, 'utf8') + jsonEscapeOverhead(s);
		return approximateWalk(value, measureString, true);
	}

	// 'estimate': character count only, no escape overhead, no toJSON()
	return approximateWalk(value, (s) => s.length, false);
}
