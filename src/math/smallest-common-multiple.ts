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
 * @throws {TypeError} If no values are provided.
 *
 * @example
 * smallestCommonMultiple(4, 5, 6); // Returns 60
 * smallestCommonMultiple(3, 7, 9); // Returns 63
 * smallestCommonMultiple(12, 15, 20); // Returns 60
 */
export function smallestCommonMultiple(...values: number[]): number {
	if (values.length === 0) {
		throw new TypeError('Reduce of empty array with no initial value');
	}

	let result = values[0];
	for (const number_ of values.slice(1)) {
		result = getScm(result, number_);
	}

	return result;
}

export function getScm(a: number, b: number): number {
	const gcd = getGcd(a, b);
	// SCM(a, 0) = 0 and SCM(0, 0) = 0 — avoid 0/0
	if (gcd === 0) return 0;
	return (a * b) / gcd;
}
