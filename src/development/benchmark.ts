/**
 * Options for the benchmark function.
 *
 * @template T - The type of the result returned by the benchmarked function.
 */
type BenchmarkOptions<T> = {
  /**
   * Optional label for the benchmark. It is used for logging purposes.
   *
   * @example "My Benchmark"
   */
  label?: string;

  /**
   * Callback function that is invoked when the benchmark is complete.
   *
   * @param info - An object containing details about the benchmark result.
   * @param info.durationMs - The time in milliseconds it took to complete the benchmark.
   * @param info.resultByteSize - The byte size of the result returned by the benchmarked function.
   * @param info.label - The label of the benchmark, if provided.
   * @param info.result - The result returned by the benchmarked function.
   */
  onBenchmarkComplete?: (info: { durationMs: number; resultByteSize: number; label?: string; result: T }) => void;
};

/**
 * A function that benchmarks another function by measuring its execution time and the size of its result.
 *
 * @template T - The type of the result returned by the benchmarked function.
 *
 * @param fn - The function to benchmark. It can return either a synchronous or asynchronous result.
 * @param options - Optional configuration options for the benchmark.
 * @returns The result of the benchmarked function (either synchronously or as a Promise).
 *
 * @example
 * benchmark(() => myFunction(), { label: "My Function Benchmark", onBenchmarkComplete: (info) => {
 *   console.log(info);
 * }});
 */
export function benchmark<T>(fn: () => T | Promise<T>, options: BenchmarkOptions<T> = {}): Promise<T> | T {
  const { onBenchmarkComplete, label } = options;
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.then((asyncResult) => {
      const durationMs = performance.now() - start;
      const resultByteSize = Buffer.byteLength(JSON.stringify(result), 'utf-8');

      if (onBenchmarkComplete) {
        onBenchmarkComplete({ durationMs, resultByteSize, label, result: asyncResult });
      } else {
        console.log(`${label} | took ${durationMs.toFixed(2)}ms`);
        console.log(`${label} | result size ${resultByteSize} bytes`);
      }

      return asyncResult;
    });
  } else {
    const durationMs = performance.now() - start;
    const resultByteSize = Buffer.byteLength(JSON.stringify(result), 'utf-8');

    if (onBenchmarkComplete) {
      onBenchmarkComplete({ durationMs, resultByteSize, label, result });
    } else {
      console.log(`${label} | took ${durationMs.toFixed(2)}ms`);
      console.log(`${label} | result size ${resultByteSize} bytes`);
    }

    return result;
  }
}
