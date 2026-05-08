import { describe, expect, it } from 'bun:test';
import { truncate } from '../../src/string/index.js';

describe('truncate function', () => {
	// Test default behavior (no options)
	it('should truncate the string at maxLength and add ellipsis', () => {
		const result = truncate('This is a long sentence that might be cut.', 20);
		expect(result).toBe('This is a long se...');
	});

	// Test with word break prevention (preserveWords is true)
	it('should truncate the string at the last space when preserveWords is true', () => {
		const result = truncate('This is a long sentence that might be cut.', 20, { preserveWords: true });
		expect(result).toBe('This is a long...');
	});

	// Test with a custom ellipsis
	it('should allow a custom ellipsis', () => {
		const result = truncate('This is a long sentence that might be cut.', 20, { ellipsis: '...' });
		expect(result).toBe('This is a long se...');
	});

	// Test with an empty string
	it('should return the original empty string', () => {
		const result = truncate('', 10);
		expect(result).toBe('');
	});

	// Test with a string shorter than maxLength
	it('should return the original string if it is shorter than maxLength', () => {
		const result = truncate('Short string', 20);
		expect(result).toBe('Short string');
	});

	// Test with maxLength smaller than ellipsis
	it('should throw an error when maxLength is smaller than the length of the ellipsis', () => {
		expect(() => truncate('Test string', 2)).toThrowError(
			'maxLength must be greater than the length of the ellipsis.',
		);
	});

	// Test when maxLength is equal to the length of the string plus ellipsis
	it('should add ellipsis correctly when maxLength equals the length of the string + ellipsis', () => {
		const result = truncate('Test string', 11, { ellipsis: '...' });
		expect(result).toBe('Test string');
	});

	// Test when preserveWords is false (no word break prevention)
	it('should truncate without preventing word break if preserveWords is false', () => {
		const result = truncate('This is a long sentence that might be cut.', 20, { preserveWords: false });
		expect(result).toBe('This is a long se...');
	});

	// Test when preserveWords is false and no spaces exist in the string
	it('should truncate the string without considering word breaks when preserveWords is false and no spaces exist', () => {
		const result = truncate('Supercalifragilisticexpialidocious', 20, { preserveWords: false });
		expect(result).toBe('Supercalifragilis...');
	});

	// Test when preserveWords is true with a string without spaces — falls back to hard truncation
	it('should fall back to hard truncation when preserveWords is true and no spaces exist in range', () => {
		const result = truncate('Reallylongwordinonestring', 20, { preserveWords: true });
		expect(result).toBe('Reallylongwordino...');
	});

	// Test when preserveWords is true with a custom ellipsis
	it('should truncate at last space using a custom ellipsis when preserveWords is true', () => {
		const result = truncate('This is a long sentence that might be cut.', 18, { ellipsis: ' …', preserveWords: true });
		expect(result).toBe('This is a long …');
	});

	// Test when preserveWords is true, custom ellipsis, and no spaces in range — falls back to hard truncation
	it('should fall back to hard truncation with custom ellipsis when preserveWords is true and no spaces exist', () => {
		const result = truncate('Supercalifragilistic', 10, { ellipsis: ' …', preserveWords: true });
		expect(result).toBe('Supercal …');
	});

	// Test when maxLength exactly equals text.length — no truncation
	it('should return the original string when maxLength equals text length', () => {
		const result = truncate('Exact', 5);
		expect(result).toBe('Exact');
	});

	// Test with no preserveWords option (defaults to false)
	it('should truncate without preventing word break if preserveWords is not provided', () => {
		const result = truncate('This is a long sentence that might be cut.', 20);
		expect(result).toBe('This is a long se...');
	});

	// Test with an invalid ellipsis (larger than maxLength)
	it('should throw an error when ellipsis length is larger than maxLength', () => {
		expect(() => truncate('Test string', 2, { ellipsis: '...' })).toThrowError(
			'maxLength must be greater than the length of the ellipsis.',
		);
	});
});
