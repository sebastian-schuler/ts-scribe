type SlugifyOptions = {
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
	 * @default true
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
 * Converts a string into a URL-friendly slug by removing accents, replacing spaces and special characters,
 * and optionally converting to lowercase. Perfect for generating SEO-friendly URLs, filenames, and identifiers.
 *
 * @category String
 * @param {string} input - The input string to slugify.
 * @param {SlugifyOptions} [options={}] - Options to customize the slugification process.
 * @returns {string} The slugified version of the input string.
 *
 * @example
 * // Basic usage (strict mode, lowercase by default)
 * slugify("Hello World!")
 * // Returns "hello-world"
 *
 * @example
 * // With custom replacement
 * slugify("Hello World! How are you?", { replacement: "-" })
 * // Returns "hello-world-how-are-you"
 *
 * @example
 * // Remove accents and special characters
 * slugify("Café Münchën")
 * // Returns "cafe-munchen"
 *
 * @example
 * // Custom replacement character
 * slugify("TypeScript is Great", { replacement: "_" })
 * // Returns "typescript_is_great"
 *
 * @example
 * // Remove specific characters with custom regex
 * slugify("Product #42 (New!)", { remove: /[#()!]/g })
 * // Returns "product-42-new"
 *
 * @example
 * // Non-strict mode (only replaces spaces)
 * slugify("Hello@World.com", { strict: false })
 * // Returns "hello@world.com"
 */
export function slugify(input: string, options: SlugifyOptions = {}): string {
	const { replacement = '-', remove, lowercase = true, strict = true } = options;

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
