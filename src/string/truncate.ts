/**
 * Truncate a string to a certain length and add an ellipsis to the end.
 * Optionally, preserve whole words by truncating at the last space before maxLength.
 * @param str - String to truncate
 * @param maxLength - Maximum length of the string (including the ellipsis)
 * @param options - Options for truncating the string
 * @returns Truncated string with ellipsis if necessary
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
