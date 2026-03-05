/**
 * Calculates the greatest common divisor (GCD) of multiple numbers.
 * The function uses the Euclidean algorithm to calculate the GCD of the given set of values.
 * It iteratively reduces the set of values to find the greatest common divisor.
 *
 * @param {...number[]} values - A list of numbers to find the GCD of.
 * @returns {number} The greatest common divisor of the provided numbers.
 *
 * @example
 * greatestCommonDivisor(12, 15, 21);     // Returns 3
 * greatestCommonDivisor(50, 75, 100);    // Returns 25
 * greatestCommonDivisor(9, 12, 15, 18);  // Returns 3
 */
export const greatestCommonDivisor = (...values: number[]): number => {
	if (values.length === 0) {
		throw new TypeError('Reduce of empty array with no initial value');
	}

	let gcd = values[0];

	for (let index = 1; index < values.length; index++) {
		gcd = getGcd(gcd, values[index]);
	}

	return gcd;
};

export const getGcd = (a: number, b: number): number => (b === 0 ? a : getGcd(b, a % b));
