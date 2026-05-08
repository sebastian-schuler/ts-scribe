import { toSeparatorCase } from './utils/case-helpers.js';

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
	return toSeparatorCase(text, '-');
}
