/**
 * Generates a random integer between the specified `min` and `max` values, inclusive.
 *
 * @category Random
 * @param min - The minimum integer value (inclusive).
 * @param max - The maximum integer value (inclusive).
 * @returns A random integer between `min` and `max` (inclusive).
 * @throws {RangeError} If `min` is greater than `max`.
 *
 * @example
 * randomInt(1, 5);    // might return 3
 * randomInt(0, 100);  // returns a random number between 0 and 100
 */
export function randomInt(min: number, max: number): number {
	if (min > max) throw new RangeError('min must be less than or equal to max');
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
