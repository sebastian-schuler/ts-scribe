/**
 * Converts a given string to camelCase format.
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The camelCase version of the input string, or an empty string if input is falsy.
 *
 * @example
 * strCamelCase('Hello world');           // "helloWorld"
 * strCamelCase('  foo_bar-baz  ');       // "fooBarBaz"
 * strCamelCase('XMLHttpRequest');        // "xmlHttpRequest"
 * strCamelCase(undefined);               // ""
 */
export function strCamelCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/[^A-Za-z0-9]+/g, '$')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}$${b}`)
    .toLowerCase()
    .replace(/(\$)(\w)/g, (m, a, b) => b.toUpperCase());
}
