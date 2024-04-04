/**
 * Check if the value is a number or at least a string that can be parsed to a number.
 * @param value - The value to check.
 * @returns Returns `true` if the value is a number, else `false`.
 */
export const isNumber = (value: unknown): value is number => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) return true;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) && isFinite(parsed);
  }
  return false;
};
