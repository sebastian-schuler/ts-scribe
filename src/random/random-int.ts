/**
 * Generates a random integer between the specified `min` and `max` values, inclusive.
 *
 * @category Random
 * @param min - The minimum integer value (inclusive).
 * @param max - The maximum integer value (inclusive).
 * @returns A random integer between `min` and `max` (inclusive). Returns `NaN` if `min` is greater than `max`.
 *
 * @example
 * randomInt(1, 5);    // might return 3
 * randomInt(0, 100);  // returns a random number between 0 and 100
 * randomInt(5, 1);    // returns NaN
 */
export const randomInt = (min: number, max: number): number => {
	if (min > max) return Number.NaN;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
