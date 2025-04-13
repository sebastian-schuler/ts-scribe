/**
 * Clamps a number within the given range (min, max).
 * If the value is less than the `min`, it returns the `min`.
 * If the value is greater than the `max`, it returns the `max`.
 * Otherwise, it returns the value itself.
 *
 * @param {number} value - The number to be clamped.
 * @param {number} min - The minimum value in the range.
 * @param {number} max - The maximum value in the range.
 * @returns {number} The clamped value, which is guaranteed to be within the [min, max] range.
 *
 * @example
 * clamp(5, 0, 10); // Returns 5
 * clamp(-1, 0, 10); // Returns 0
 * clamp(15, 0, 10); // Returns 10
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
