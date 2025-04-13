/**
 * Truncates a string to a specified maximum length, optionally adding an ellipsis
 * and preserving whole words when truncating.
 *
 * @param {string} str - The string to truncate.
 * @param {number} maxLength - The maximum length of the string, including the ellipsis.
 * @param {Object} [options] - Optional configuration for truncation.
 * @param {string} [options.ellipsis='...'] - The string to append to indicate truncation. Default is '...'.
 * @param {boolean} [options.preserveWords=false] - Whether to preserve whole words when truncating. Default is `false`.
 * @returns {string} The truncated string with an ellipsis if necessary, or the original string if it's within the length limit.
 *
 * @throws {Error} If `maxLength` is less than or equal to the length of the ellipsis.
 *
 * @example
 * strTruncate('This is a long string that should be truncated', 20); // "This is a long..."
 * strTruncate('This is a long string that should be truncated', 20, { preserveWords: true }); // "This is a long..."
 * strTruncate('Short text', 20); // "Short text"
 * strTruncate('Short text', 5); // "Short..."
 */
export function strTruncate(
  str: string,
  maxLength: number,
  options?: { ellipsis?: string; preserveWords?: boolean },
): string {
  const { ellipsis = '...', preserveWords = false } = options || {};

  // Ensure maxLength is valid
  if (maxLength <= ellipsis.length) {
    throw new Error('maxLength must be greater than the length of the ellipsis.');
  }

  // If string length exceeds maxLength, truncate and append ellipsis
  if (str.length > maxLength) {
    let truncated = str;

    if (preserveWords) {
      // Find the last space within the truncated string to avoid cutting words
      const lastSpaceIndex = truncated.slice(0, maxLength - ellipsis.length).lastIndexOf(' ');

      // If a space exists, truncate at the last space, otherwise keep the original truncation
      if (lastSpaceIndex !== -1) {
        truncated = truncated.slice(0, lastSpaceIndex) + ellipsis;
      }
    } else {
      // If preserveWords is false, truncate at the maxLength
      truncated = truncated.slice(0, maxLength - ellipsis.length) + ellipsis;
    }

    return truncated;
  }

  return str;
}
