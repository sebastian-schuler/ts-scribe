/**
 * Converts a given string to dot.case format.
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The dot.case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * strDotCase('HelloWorld');         // "hello.world"
 * strDotCase('foo_bar-baz');        // "foo.bar.baz"
 * strDotCase('  someInputValue ');  // "some.input.value"
 * strDotCase(undefined);            // ""
 */
export function strDotCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, '.')
    .toLowerCase();
}
