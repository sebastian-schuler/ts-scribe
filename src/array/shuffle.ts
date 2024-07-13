/**
 * Shuffle an array (doesn't affect the original)
 * @param array
 * @returns shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArr: T[] = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}
