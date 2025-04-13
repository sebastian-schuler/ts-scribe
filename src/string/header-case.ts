/**
 * Converts a given string to Header-Case (also known as Title Case with spaces).
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The Header-Case version of the input string, or an empty string if input is falsy.
 *
 * @example
 * strHeaderCase('helloWorld');       // "Hello World"
 * strHeaderCase('foo_bar-baz');      // "Foo Bar Baz"
 * strHeaderCase('  someInputValue'); // "Some Input Value"
 * strHeaderCase(undefined);          // ""
 */
export function strHeaderCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, ' ')
    .toLowerCase()
    .replace(/( ?)(\w+)( ?)/g, (m, a, b, c) => a + b.charAt(0).toUpperCase() + b.slice(1) + c);
}
