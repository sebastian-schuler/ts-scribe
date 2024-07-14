/**
 * Compute the greatest common divisor between any amount of numbers
 * @param values
 * @returns greatest common divisor
 */
export const greatestCommonDivisor = (...values: number[]): number => {
  return values.reduce((gcd, num) => getGcd(gcd, num));
};

export const getGcd = (a: number, b: number): number => (b === 0 ? a : getGcd(b, a % b));
