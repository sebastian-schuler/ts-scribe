import { toSeparatorCase } from './utils/case-helpers.js';

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
	return toSeparatorCase(text, '.');
}
