/**
 * Generates a random string of the specified length, with options to include numbers and symbols.
 *
 * @param {number} length - The length of the generated string.
 * @param {Object} options - Configuration options for the string generation.
 * @param {boolean} [options.includeNumbers=false] - Whether to include numeric characters (0–9). Defaults to `false`.
 * @param {boolean} [options.includeSymbols=false] - Whether to include symbol characters (e.g., !@#$...). Defaults to `false`.
 * @returns {string} A randomly generated string containing uppercase and lowercase letters, and optionally numbers and symbols.
 *
 * @example
 * randomString(10);                             // e.g., "aZkLpCmhN"
 * randomString(5, { includeNumbers: true });     // e.g., "aB1c9"
 * randomString(8, { includeNumbers: true, includeSymbols: true }); // e.g., "aB3!Lp9&"
 * randomString(12, { includeNumbers: false, includeSymbols: false }); // e.g., "aBcDeFgHiJkL"
 */
export function randomString(
  length: number,
  { includeNumbers = false, includeSymbols = false }: { includeNumbers: boolean; includeSymbols: boolean } = {
    includeNumbers: false,
    includeSymbols: false,
  },
): string {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_-+=<>?/[]{},.:;';

  let validChars = uppercaseLetters + lowercaseLetters;
  if (includeNumbers) validChars += numbers;
  if (includeSymbols) validChars += symbols;

  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * validChars.length);
    randomString += validChars[randomIndex];
  }

  return randomString;
}
