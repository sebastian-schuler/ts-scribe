/**
 * Asynchronous for each function running in parallel (behaving like Promise.all)
 * @param array - dataset to iterate
 * @param callback - function to call on each array item
 */
export async function asyncForEach<T>(
  array: T[],
  callback: (element: T, index: number, array: T[]) => Promise<void>,
  limit?: number,
): Promise<void> {
  if (!limit) limit = array.length;
  const promises: Promise<void>[] = [];
  const executing: Promise<void>[] = [];

  for (let index = 0; index < array.length; index++) {
    const p = callback(array[index], index, array);
    promises.push(p);

    if (limit <= array.length) {
      const e = p.then(() => {
        const idx = executing.indexOf(e);
        if (idx !== -1) {
          executing.splice(idx, 1);
        }
      });
      //   const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  await Promise.all(promises);

  //   const promises = array.map((element, index) => callback(element, index, array));
  //   await Promise.all(promises);
}
