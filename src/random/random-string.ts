/**
 * Generates a random string of the specified length, with options to include numbers and symbols.
 *
 * @category Random
 * @param length - The length of the generated string.
 * @param options - Configuration options for the string generation.
 * @param options.includeNumbers - Whether to include numeric characters (0–9). Defaults to `false`.
 * @param options.includeSymbols - Whether to include symbol characters (e.g., !@#$...). Defaults to `false`.
 * @returns A randomly generated string containing uppercase and lowercase letters, and optionally numbers and symbols.
 *
 * @example
 * randomString(10);                             // e.g., "aZkLpCmhN"
 * randomString(5, { includeNumbers: true });     // e.g., "aB1c9"
 * randomString(8, { includeNumbers: true, includeSymbols: true }); // e.g., "aB3!Lp9&"
 * randomString(12, { includeNumbers: false, includeSymbols: false }); // e.g., "aBcDeFgHiJkL"
 */
export function randomString(length: number, options?: { includeNumbers: boolean; includeSymbols: boolean }): string {
	const includeNumbers = options?.includeNumbers ?? false;
	const includeSymbols = options?.includeSymbols ?? false;

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
