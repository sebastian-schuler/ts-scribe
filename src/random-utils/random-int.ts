/**
 * Returns a random integer between min and max (inclusive)
 * @param min
 * @param max
 * @returns
 */
export const randomInt = (min: number = 0, max: number = Number.MAX_VALUE) => {
  if (min > max) return NaN;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
