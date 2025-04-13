/**
 * Converts a given string to snake_case.
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The snake_case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * strSnakeCase('helloWorld');          // "hello_world"
 * strSnakeCase('foo_bar-baz');         // "foo_bar_baz"
 * strSnakeCase(' SomeInputValue ');    // "some_input_value"
 * strSnakeCase(undefined);             // ""
 */
export function strSnakeCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => a + '_' + b.toLowerCase())
    .replace(/[^A-Za-z0-9]+|_+/g, '_')
    .toLowerCase();
}
