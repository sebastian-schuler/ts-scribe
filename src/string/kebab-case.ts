/**
 * Converts a given string to kebab-case.
 * @category String
 * @param {string | undefined} text - The input string to convert.
 * @returns {string} The kebab-case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toKebabCase('helloWorld');         // "hello-world"
 * toKebabCase('foo_bar-baz');        // "foo-bar-baz"
 * toKebabCase(' SomeInputValue  ');  // "some-input-value"
 * toKebabCase(undefined);            // ""
 */
export function toKebabCase(text: string | undefined): string {
	if (!text) return '';

	return String(text)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/([a-z])([A-Z])/g, '$1_$2')
		.replaceAll(/[^A-Za-z\d]+|_+/g, '-')
		.toLowerCase();
}
