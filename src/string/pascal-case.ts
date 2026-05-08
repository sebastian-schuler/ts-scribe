/**
 * Converts a given string to PascalCase.
 * @category String
 * @param {string | undefined} text - The input string to convert.
 * @returns {string} The PascalCase version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toPascalCase('hello world');         // "HelloWorld"
 * toPascalCase('foo_bar-baz');         // "FooBarBaz"
 * toPascalCase(' someInputValue  ');   // "SomeInputValue"
 * toPascalCase(undefined);             // ""
 */
export function toPascalCase(text: string | undefined): string {
	if (!text) return '';

	return String(text)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/gv, '$')
		.replaceAll(/[^A-Za-z\d]+/gv, '$')
		.replaceAll(/([a-z])([A-Z])/gv, (m: string, a: string, b: string) => `${a}$${b}`)
		.toLowerCase()
		.replaceAll(/(\$)(\w?)/gv, (m: string, a: string, b: string): string => b.toUpperCase());
}
