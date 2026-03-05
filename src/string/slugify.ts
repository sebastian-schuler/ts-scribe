/**
 * Options for customizing the slugification process.
 * @interface SlugifyOptions
 */
export type SlugifyOptions = {
	/**
	 * Character to replace spaces and non-alphanumeric characters with.
	 * @default '-'
	 */
	replacement?: string;

	/**
	 * A custom regular expression to remove certain characters from the input.
	 */
	remove?: RegExp;

	/**
	 * Whether to convert the slug to lowercase.
	 * @default false
	 */
	lowercase?: boolean;

	/**
	 * Whether to enforce strict rules for allowed characters.
	 * If true, only alphanumeric characters, hyphen, underscore, dot, and tilde are allowed.
	 * @default true
	 */
	strict?: boolean;
};

/**
 * Slugifies an input string, optionally applying customization based on the provided options.
 * @param {string} input - The input string to slugify.
 * @param {SlugifyOptions} [options={}] - Options to customize the slugification process.
 * @returns {string} The slugified version of the input string.
 *
 * @example
 * slugifyString("Hello World! How are you?", { lowercase: true, replacement: "-" })
 * // Returns "hello-world-how-are-you"
 */
export function slugifyString(input: string, options: SlugifyOptions = {}): string {
	const { replacement = '-', remove, lowercase = false, strict = true } = options;

	let slug = input.normalize('NFKD').replaceAll(/[\u0300-\u036F]/g, ''); // Remove accents

	if (remove) {
		slug = slug.replace(remove, '');
	}

	// For strict mode, only allow URL path-safe chars
	const allowed = strict ? /[^\w-.~]+/g : /\s+/g;

	// Replace any characters not allowed with the replacement
	slug = slug.replace(allowed, replacement);

	// Replace multiple consecutive replacement chars with a single one
	const multiReplacement = new RegExp(`${escapeRegex(replacement)}{2,}`, 'g');
	slug = slug.replace(multiReplacement, replacement);

	// Trim leading or trailing replacement chars
	const boundary = new RegExp(`^${escapeRegex(replacement)}+|${escapeRegex(replacement)}+$`, 'g');
	slug = slug.replace(boundary, '');

	return lowercase ? slug.toLowerCase() : slug;
}

function escapeRegex(string_: string): string {
	return string_.replaceAll(/[-/\\^$*+?.()|[\]{}]/g, String.raw`\$&`);
}
