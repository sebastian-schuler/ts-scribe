/**
 * Converts a given string to snake_case.
 *
 * @param {string | undefined} text - The input string to convert.
 * @returns {string} The snake_case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toSnakeCase('helloWorld');          // "hello_world"
 * toSnakeCase('foo_bar-baz');         // "foo_bar_baz"
 * toSnakeCase(' SomeInputValue ');    // "some_input_value"
 * toSnakeCase(undefined);             // ""
 */
export function toSnakeCase(text: string | undefined): string {
	if (!text) return '';

	return String(text)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/([a-z])([A-Z])/g, (m: string, a: string, b: string) => a + '_' + b.toLowerCase())
		.replaceAll(/[^A-Za-z\d]+|_+/g, '_')
		.toLowerCase();
}
