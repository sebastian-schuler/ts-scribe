type BenchmarkOptions<T> = {
  label?: string;
  onBenchmarkComplete?: (info: { durationMs: number; resultByteSize: number; label?: string; result: T }) => void;
};

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
