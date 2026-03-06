/**
 * Converts a given string to dot.case format.
 *
 * @category String
 * @param {string | undefined} text - The input string to convert.
 * @returns {string} The dot.case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toDotCase('HelloWorld');         // "hello.world"
 * toDotCase('foo_bar-baz');        // "foo.bar.baz"
 * toDotCase('  someInputValue ');  // "some.input.value"
 * toDotCase(undefined);            // ""
 */
export function toDotCase(text: string | undefined): string {
	if (!text) return '';

	return String(text)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/([a-z])([A-Z])/g, '$1_$2')
		.replaceAll(/[^A-Za-z\d]+|_+/g, '.')
		.toLowerCase();
}
