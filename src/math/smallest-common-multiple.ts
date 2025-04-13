import { getGcd } from './greatest-common-divisor.js';

/**
 * Compute the smallest common multiple between any amount of numbers
 * @param values
 * @returns smallest common multiple
 */
export const smallestCommonMultiple = (...values: number[]): number => {
  return values.reduce((gcd, num) => getScm(gcd, num));
};

export const getScm = (a: number, b: number): number => (a * b) / getGcd(a, b);
