/**
 * Converts a string to a case format that uses a consistent separator between
 * words (e.g. `_`, `-`, `.`). Handles camelCase boundaries, existing
 * separators, and special characters.
 *
 * @param text      - The input string, or `undefined`.
 * @param separator - The character to place between words.
 * @returns The converted string, or an empty string for falsy input.
 *
 * @internal
 */
export function toSeparatorCase(text: string | undefined, separator: string): string {
	if (!text) return '';

	return String(text)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/([a-z])([A-Z])/g, '$1_$2')
		.replaceAll(/[^A-Za-z\d]+|_+/g, separator)
		.toLowerCase();
}
