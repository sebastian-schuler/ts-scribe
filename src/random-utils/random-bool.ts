/**
 * Returns a random boolean value.
 * @param probability - The probability of returning true, must be between 0 and 1. (default: 0.5)
 * @returns True or False
 */
export const randomBool = (probability: number = 0.5) => {
  return Math.random() < probability;
};
