/**
 * Chunks an array into smaller arrays of a specified size.
 *
 * This function splits a large array into smaller sub-arrays, each containing
 * up to the specified number of elements. If the original array can't be
 * evenly divided, the last chunk will contain the remaining elements.
 *
 * @param {T[]} arr - The array to chunk.
 * @param {number} size - The size of each chunk.
 * @returns {T[][]} An array of smaller arrays, each containing up to the specified size.
 *
 * @example
 * const arr = [1, 2, 3, 4, 5, 6];
 * const chunked = arrayChunk(arr, 2);
 * console.log(chunked); // [[1, 2], [3, 4], [5, 6]]
 */
export const arrayChunk = <T>(array: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}

	return chunks;
};
