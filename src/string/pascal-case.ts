/**
 * Converts a given string to PascalCase.
 *
 * @param {string | undefined} str - The input string to convert.
 * @returns {string} The PascalCase version of the input string, or an empty string if input is falsy.
 *
 * @example
 * strPascalCase('hello world');         // "HelloWorld"
 * strPascalCase('foo_bar-baz');         // "FooBarBaz"
 * strPascalCase(' someInputValue  ');   // "SomeInputValue"
 * strPascalCase(undefined);             // ""
 */
export function strPascalCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '$')
    .replace(/[^A-Za-z0-9]+/g, '$')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}$${b}`)
    .toLowerCase()
    .replace(/(\$)(\w?)/g, (m, a, b) => b.toUpperCase());
}
