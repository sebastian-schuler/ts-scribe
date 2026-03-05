/**
 * Converts a given string to Header-Case (also known as Title Case with spaces).
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The Header-Case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toHeaderCase('helloWorld');       // "Hello World"
 * toHeaderCase('foo_bar-baz');      // "Foo Bar Baz"
 * toHeaderCase('  someInputValue'); // "Some Input Value"
 * toHeaderCase(undefined);          // ""
 */
export function toHeaderCase(string_: string | undefined): string {
	if (!string_) return '';

	return String(string_)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/([a-z])([A-Z])/g, (m: string, a: string, b: string) => `${a}_${b.toLowerCase()}`)
		.replaceAll(/[^A-Za-z\d]+|_+/g, ' ')
		.toLowerCase()
		.replaceAll(
			/( ?)(\w+)( ?)/g,
			(m: string, a: string, b: string, c: string) => a + b.charAt(0).toUpperCase() + b.slice(1) + c,
		);
}
