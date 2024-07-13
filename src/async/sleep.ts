/**
 * Pause the process for a certain amount of time
 * @param ms - time in milliseconds
 */
export async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
