import { getGcd } from './greatest-common-divisor.js';

/**
 * Calculates the smallest common multiple (SCM) of multiple numbers.
 * The function iteratively finds the SCM of the provided values using the relationship
 * between the greatest common divisor (GCD) and SCM.
 * The formula used is: `SCM(a, b) = |a * b| / GCD(a, b)`.
 *
 * @category Math
 * @param {...number[]} values - A list of numbers to find the SCM of.
 * @returns {number} The smallest common multiple of the provided numbers.
 *
 * @example
 * smallestCommonMultiple(4, 5, 6); // Returns 60
 * smallestCommonMultiple(3, 7, 9); // Returns 63
 * smallestCommonMultiple(12, 15, 20); // Returns 60
 */
export const smallestCommonMultiple = (...values: number[]): number => {
	let result = values[0];
	for (const number_ of values.slice(1)) {
		result = getScm(result, number_);
	}

	return result;
};

export const getScm = (a: number, b: number): number => (a * b) / getGcd(a, b);
