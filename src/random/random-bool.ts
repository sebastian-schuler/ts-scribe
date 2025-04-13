/**
 * Returns a random boolean value based on the given probability.
 *
 * @param {number} [probability=0.5] - A number between 0 and 1 representing the probability of returning `true`.
 * @returns {boolean} `true` with the given probability, otherwise `false`.
 *
 * @example
 * randomBool();         // ~50% chance of returning true
 * randomBool(0.9);      // ~90% chance of returning true
 * randomBool(0.1);      // ~10% chance of returning true
 */
export const randomBool = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};
