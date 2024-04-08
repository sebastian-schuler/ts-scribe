/**
 * Generates a random string of the specified length.
 * @param length - The length of the random string to generate.
 * @param includeNumbers - Whether to include numbers in the random string (default: true)
 * @param includeSymbols - Whether to include symbols in the random string (default: true)
 * @returns The generated random string.
 */
export function randomString(length: number, includeNumbers: boolean = true, includeSymbols: boolean = true): string {
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
