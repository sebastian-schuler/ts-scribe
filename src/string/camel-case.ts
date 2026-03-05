/**
 * Converts a given string to camelCase format.
 *
 * @param {string | undefined} text - The input string to convert.
 * @returns {string} The camelCase version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toCamelCase('Hello world');           // "helloWorld"
 * toCamelCase('  foo_bar-baz  ');       // "fooBarBaz"
 * toCamelCase('XMLHttpRequest');        // "xmlHttpRequest"
 * toCamelCase(undefined);               // ""
 */
export function toCamelCase(text: string | undefined): string {
	if (!text) return '';

	return String(text)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/[^A-Za-z\d]+/g, '$')
		.replaceAll(/([a-z])([A-Z])/g, (m, a, b) => `${a}$${b}`)
		.toLowerCase()
		.replaceAll(/(\$)(\w)/g, (_m: string, _a: string, b: string) => b.toUpperCase());
}
