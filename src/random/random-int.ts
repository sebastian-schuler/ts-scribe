/**
 * Generates a random integer between the specified `min` and `max` values, inclusive.
 *
 * @category Random
 * @param min - The minimum integer value (inclusive). Defaults to 0.
 * @param max - The maximum integer value (inclusive). Defaults to Number.MAX_VALUE.
 * @returns A random integer between `min` and `max` (inclusive). Returns `NaN` if `min` is greater than `max`.
 *
 * @example
 * randomInt(1, 5);    // might return 3
 * randomInt(10);      // returns a random number between 10 and Number.MAX_VALUE
 * randomInt();        // returns a random number between 0 and Number.MAX_VALUE
 * randomInt(5, 1);    // returns NaN
 */
export const randomInt = (min = 0, max: number = Number.MAX_VALUE): number => {
	if (min > max) return Number.NaN;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
