export function parseNumber(
  value: string | number | null | undefined,
  defaultValue: number = 0,
  type: 'int' | 'float' = 'float',
  throwInvalid: boolean = false,
): number {
  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) return defaultValue;
    if (type === 'int') {
      return Number.isInteger(value) ? value : defaultValue;
    }
    return value;
  }

  if (value === null || value === undefined || (typeof value === 'string' && value.length === 0)) return defaultValue;

  const parsedValue = Number(value);
  if (isNaN(parsedValue) || !Number.isFinite(parsedValue)) {
    if (throwInvalid) throw new TypeError(`parseNumber failed with: ${value}`);
    return defaultValue;
  }

  return parsedValue;
}
