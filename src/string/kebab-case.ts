/**
 * Converts a given string to kebab-case.
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The kebab-case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * strKebabCase('helloWorld');         // "hello-world"
 * strKebabCase('foo_bar-baz');        // "foo-bar-baz"
 * strKebabCase(' SomeInputValue  ');  // "some-input-value"
 * strKebabCase(undefined);            // ""
 */
export function strKebabCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, '-')
    .toLowerCase();
}
