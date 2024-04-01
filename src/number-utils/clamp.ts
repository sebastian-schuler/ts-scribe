/**
 * Clamps a value between an upper and lower bound
 * @param value
 * @param min
 * @param max
 * @returns The clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
