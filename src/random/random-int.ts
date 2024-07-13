/**
 * Returns a random integer between min and max (inclusive)
 * @param min - The minimum value (default: 0)
 * @param max - The maximum value (default: Number.MAX_VALUE)
 * @returns The random integer
 */
export const randomInt = (min: number = 0, max: number = Number.MAX_VALUE) => {
  if (min > max) return NaN;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
