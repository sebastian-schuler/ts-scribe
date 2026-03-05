/**
 * Converts a given string to dot.case format.
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The dot.case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * toDotCase('HelloWorld');         // "hello.world"
 * toDotCase('foo_bar-baz');        // "foo.bar.baz"
 * toDotCase('  someInputValue ');  // "some.input.value"
 * toDotCase(undefined);            // ""
 */
export function toDotCase(string_: string | undefined): string {
	if (!string_) return '';

	return String(string_)
		.replaceAll(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
		.replaceAll(/([a-z])([A-Z])/g, '$1_$2')
		.replaceAll(/[^A-Za-z\d]+|_+/g, '.')
		.toLowerCase();
}
