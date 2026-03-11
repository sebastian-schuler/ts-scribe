import { safeJsonStringify } from '../core/safe-json-stringify.js';

/**
 * Options for masking sensitive properties in objects.
 *
 * @category Object
 */
export type MaskObjectOptions = {
	/**
	 * List of property keys to mask (checked at any depth).
	 * These keys will be masked wherever they appear in the object tree.
	 */
	keys?: string[];

	/**
	 * Custom function to determine if a property is sensitive.
	 * If returns true, the property value will be masked.
	 *
	 * @param key - The property name
	 * @param value - The property value
	 * @param path - Dot-notation path (e.g. "user.payment.card")
	 * @param depth - Current nesting level
	 * @returns true if the property should be masked
	 */
	isSensitive?: (key: string, value: unknown, path: string, depth: number) => boolean;

	/**
	 * Custom function to determine if traversal should skip descending into an object.
	 * Useful for skipping special objects like GeoJSON geometries, DOM nodes, etc.
	 *
	 * @param value - The object/array to potentially skip
	 * @param path - Dot-notation path
	 * @param depth - Current nesting level
	 * @returns true to skip descending into this object
	 */
	shouldSkip?: (value: unknown, path: string, depth: number) => boolean;

	/**
	 * Custom function to mask a property value.
	 * If provided, this function is called for masked properties instead of using default masking.
	 *
	 * @param value - The value to mask
	 * @param key - The property name
	 * @param path - Dot-notation path
	 * @returns The masked value (typically a string)
	 */
	maskFn?: (value: unknown, key: string, path: string) => string;

	/**
	 * Character used for masking (default: '*')
	 */
	char?: string;

	/**
	 * Maximum nesting depth (default: 100, Infinity for unlimited).
	 * Beyond this depth, objects are not traversed further.
	 */
	maxDepth?: number;

	/**
	 * Whether to mask array elements (default: true).
	 * When false, arrays are traversed but individual array items are not masked.
	 */
	maskArrays?: boolean;
};

/**
 * Default masking function that replaces content with a character.
 */
function defaultMaskFn(value: unknown, char: string): string {
	const string_ = String(value);
	// For strings like emails or sensitive data, keep some structure if recognizable
	if (typeof value === 'string' && value.includes('@')) {
		// Email-like: keep first char and domain
		const [local, domain] = value.split('@');
		if (domain) {
			return `${local[0]}${char.repeat(Math.max(3, local.length - 1))}@${domain}`;
		}
	}

	// Default: mask all but show length
	return char.repeat(Math.min(string_.length, Math.max(3, Math.ceil(string_.length / 2))));
}

/**
 * Check if a value is a special object type that should be preserved as-is
 */
function isSpecialObjectType(value: unknown): boolean {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	return (
		value instanceof Date ||
		value instanceof RegExp ||
		value instanceof Error ||
		value instanceof Map ||
		value instanceof Set ||
		value instanceof WeakMap ||
		value instanceof WeakSet ||
		ArrayBuffer.isView(value)
	);
}

/**
 * Masks sensitive properties in an object or array recursively.
 * Traverses deeply nested structures and masks properties based on keys, predicates, or custom logic.
 *
 * This function creates a deep copy of the input object/array while masking sensitive values.
 * It handles circular references, special object types (Date, RegExp, Error, etc.), and deeply
 * nested structures. Non-sensitive values are preserved as-is.
 *
 * @category Object
 * @param object - The object or array to mask.
 * @param options - Configuration options for masking behavior.
 * @returns A new object with masked properties (returns original if no masking needed).
 *
 * @template T - The type of the object or array being masked.
 *
 * @example
 * // Mask by key list
 * const user = {
 *   name: 'John',
 *   email: 'john@example.com',
 *   ssn: '123-45-6789'
 * };
 * const masked = objectMask(user, { keys: ['ssn', 'email'] });
 * console.log(masked);
 * // Output: {
 * //   name: 'John',
 * //   email: 'j***@example.com',
 * //   ssn: '***'
 * // }
 *
 * @example
 * // Mask with predicate function
 * const userData = {
 *   username: 'john_doe',
 *   password: 'secret123',
 *   apiToken: 'sk_live_xyz'
 * };
 * const masked = objectMask(userData, {
 *   isSensitive: (key, value, path) =>
 *     key.toLowerCase().includes('password') ||
 *     key.toLowerCase().includes('token')
 * });
 * console.log(masked);
 * // Output: {
 * //   username: 'john_doe',
 * //   password: '*****',
 * //   apiToken: '******'
 * // }
 *
 * @example
 * // Skip descending into specific objects (e.g., GeoJSON features)
 * const data = {
 *   apiKey: 'secret123',
 *   geometry: {
 *     type: 'Feature',
 *     coordinates: [10, 20],
 *     properties: { secret: 'should-not-mask' }
 *   }
 * };
 * const masked = objectMask(data, {
 *   keys: ['apiKey'],
 *   shouldSkip: (value) => value?.type === 'Feature'
 * });
 * console.log(masked);
 * // Output: apiKey is masked, but geometry object is preserved as-is
 *
 * @example
 * // Mask entire GeoJSON geometries without descending
 * const isGeoJSON = (v: any) =>
 *   v?.type && v?.coordinates &&
 *   ['Point', 'LineString', 'Polygon'].includes(v.type);
 *
 * const geoData = {
 *   name: 'Location',
 *   geometry: {
 *     type: 'Point',
 *     coordinates: [125.6, 10.1]
 *   }
 * };
 * const masked = objectMask(geoData, {
 *   isSensitive: (key, value) => key === 'geometry' && isGeoJSON(value)
 * });
 * console.log(masked);
 * // Output: { name: 'Location', geometry: '***' }
 *
 * @example
 * // Custom masking function
 * const data = {
 *   ssn: '123-45-6789',
 *   email: 'john@example.com'
 * };
 * const masked = objectMask(data, {
 *   keys: ['ssn', 'email'],
 *   maskFn: (value, key) => {
 *     if (key === 'ssn') return '***-**-' + String(value).slice(-4);
 *     if (key === 'email') return String(value).replace(/(.{1}).*@/, '$1***@');
 *     return '***';
 *   }
 * });
 * console.log(masked);
 * // Output: { ssn: '***-**-6789', email: 'j***@example.com' }
 *
 * @remarks
 * **Performance Considerations:**
 * - Uses WeakMap for circular reference tracking (O(1) lookups)
 * - For large objects marked as sensitive, serialization is used for masking
 * - Consider using `shouldSkip` for known large structures that don't need masking
 * - Special object types (Date, RegExp, Error, Map, Set, etc.) are preserved without traversal
 *
 * **Type Preservation:**
 * - Date, RegExp, Error, Map, Set, WeakMap, WeakSet, and TypedArrays are preserved as-is
 * - Functions are preserved without modification
 * - Circular references are maintained in the result structure
 *
 * **Depth Control:**
 * - Default maxDepth is 100 to prevent stack overflow on deeply nested objects
 * - Beyond maxDepth, objects are returned unchanged without further processing
 */
export function objectMask<T extends Record<string, any> | any[]>(
	object: T,
	options?: MaskObjectOptions,
): T extends readonly any[] ? readonly any[] : T;
export function objectMask(object: any, options: MaskObjectOptions = {}): any {
	const { keys = [], isSensitive, shouldSkip, maskFn, char = '*', maxDepth = 100, maskArrays = true } = options;

	// Track visited objects to handle circular references
	const visited = new WeakMap<object, unknown>();

	/**
	 * Process array items recursively
	 */
	function processArray(array: unknown[], path: string, depth: number): unknown[] {
		const result: unknown[] = [];
		visited.set(array, result);

		for (const [index, item] of array.entries()) {
			const itemPath = `${path}[${index}]`;

			if (typeof item !== 'object' || item === null) {
				if (maskArrays && isSensitive?.(String(index), item, itemPath, depth)) {
					result.push(maskFn?.(item, String(index), itemPath) ?? defaultMaskFn(item, char));
				} else {
					result.push(item);
				}
			} else {
				result.push(process(item, itemPath, depth + 1));
			}
		}

		return result;
	}

	/**
	 * Determine the masked value for a sensitive property
	 */
	function getMaskedValue(value: unknown, key: string, path: string): string {
		if (maskFn) {
			return maskFn(value, key, path);
		}

		return typeof value === 'object' && value !== null
			? defaultMaskFn(safeJsonStringify(value), char)
			: defaultMaskFn(value, char);
	}

	/**
	 * Process a single object property
	 */
	function processProperty(key: string, value: unknown, path: string, depth: number): unknown {
		const keyInList = keys.includes(key);
		const isSensitiveProperty = keyInList || isSensitive?.(key, value, path, depth);

		if (isSensitiveProperty && typeof value !== 'object') {
			return getMaskedValue(value, key, path);
		}

		if (isSensitiveProperty && typeof value === 'object' && value !== null) {
			if (Array.isArray(value) && !maskArrays) {
				return process(value, path, depth + 1);
			}

			return getMaskedValue(value, key, path);
		}

		if (typeof value === 'object' && value !== null) {
			return process(value, path, depth + 1);
		}

		return value;
	}

	/**
	 * Recursively process and mask the object
	 */
	function process(value: unknown, path: string, depth: number): unknown {
		if (depth > maxDepth || value === null || value === undefined) {
			return value;
		}

		if (typeof value !== 'object') {
			return value;
		}

		if (visited.has(value)) {
			return visited.get(value);
		}

		if (shouldSkip?.(value, path, depth)) {
			return value;
		}

		if (isSpecialObjectType(value)) {
			return value;
		}

		if (Array.isArray(value)) {
			return processArray(value, path, depth);
		}

		// Handle plain objects
		const result: Record<string, unknown> = {};
		visited.set(value, result);

		for (const key in value) {
			if (!Object.hasOwn(value, key)) {
				continue;
			}

			const propertyValue = (value as Record<string, unknown>)[key];
			const propertyPath = path ? `${path}.${key}` : key;

			result[key] = processProperty(key, propertyValue, propertyPath, depth);
		}

		return result;
	}

	return process(object, '', 0);
}
