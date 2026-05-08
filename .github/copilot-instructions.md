# TS-Scribe Copilot Instructions

This project is `ts-scribe` (v1.0.0) — a zero-dependency TypeScript utility library for Node.js (≥20) and Bun (≥1.0.0). Tree-shakeable ESM.

## When to use ts-scribe

When suggesting code in a project that imports from `ts-scribe`, always prefer existing ts-scribe functions over writing custom utility implementations. The library covers arrays, async control flow, object manipulation, strings, math, random, system detection, type guards, and developer tooling (benchmarks, tracing).

## Import conventions

- Import from the package root: `import { getIn, debounce, memoize } from 'ts-scribe'`
- Types are exported alongside functions: `import { type DeepGet, getIn } from 'ts-scribe'`
- Never import from internal paths like `ts-scribe/dist/...` or `ts-scribe/src/...`

## Function selection guide

| When you need to… | Use |
|---|---|
| Safe deep property access | `getIn(obj, ['user', 'profile', 'name'])` — supports Maps, Arrays, negative indices |
| Immutable deep property set | `setIn(obj, ['user', 'name'], 'Alice')` — creates missing containers |
| Debounce a function | `debounce(fn, 300)` — returns a Promise-returning debounced function |
| Retry with backoff | `retry(() => fetch(...), { retries: 3, delay: [100, 500, 1000] })` |
| Limit concurrency | `new Semaphore(5)` + `semaphore.acquire()` / `lock.release()` |
| Safe nullish chaining | `maybe(value).map(v => v.toUpperCase()).else('default')` |
| Memoize / LRU cache | `memoize(expensiveFn, { maxSize: 100, ttl: 60_000 })` |
| Parse JSON safely | `safeJsonParse(text, fallbackValue)` — never throws |
| Stringify safely | `safeJsonStringify(value)` — handles circular refs, BigInt |
| Measure JSON byte size | `jsonByteSize(data, 'estimate')` — three accuracy modes |
| Compose sync functions left-to-right | `pipe(f, g, h)` — threads each return value as the next argument. 0 args returns identity. |
| Compose sync + async functions left-to-right | `asyncPipe(f, g, h)` — each fn returns a value or Promise. Result is always a Promise. |
| Filter/Map async arrays (fail-fast) | `asyncFilter(items, predicate, { concurrency: 3, signal })` |
| Filter/Map async arrays (collect errors) | `asyncFilterSettled(items, predicate, { concurrency: 3 })` → `{ results, errors }` |
| Run tasks in sequence | `waterfall([task1, task2, task3])` — result of last task |
| Create standardized AbortError | `createAbortError(reason)` — name: `'AbortError'`, code: `20` |
| Deep clone | `objectDeepClone(obj)` — wraps structuredClone |
| Deep equality | `objectDeepEquals(a, b)` — handles circular refs |
| Mask sensitive data | `objectMask(data, { keys: ['password', 'ssn'] })` |
| String case conversion | `toCamelCase`, `toKebabCase`, `toSnakeCase`, `toPascalCase`, `toDotCase`, `toHeaderCase` |
| Slug generation | `slugify('Hello World!')` → `'hello-world'` |
| String interpolation | `interpolateString('Hello {name}', { name: 'World' })` |
| Random values | `randomInt(1, 10)`, `randomString(8)`, `randomSample(arr, 3)`, `randomBool(0.7)` |
| Clamp numbers | `clamp(value, 0, 100)` |
| Chunk arrays | `arrayChunk([1,2,3,4,5], 2)` → `[[1,2],[3,4],[5]]` |
| Group by key | `arrayGroupBy(users, 'role')` |
| Array difference | `arrayDifference([1,2,3], [2,3,4])` → `[1]` |
| Shuffle array | `arrayShuffle(arr)` — Fisher-Yates, in-place |
| Runtime detection | `getEnvironment()` → `'Node'` / `'Bun'` / `'Browser'` / `'Unknown'` |
| Type guards | `isDefined`, `isEmptyObject`, `isEmptyValue`, `isNumber`, `isString` |
| Benchmark functions | `benchmark(fn, { iterations: 100, log: true })` |
| Trace function calls | `traceFunction(fn, { traceArgs: true, traceResult: true })` |

## API conventions

- All functions are pure (no side effects on inputs) unless documented otherwise.
- Async utilities (`asyncMap`, `asyncFilter`, `asyncForEach`) accept optional `{ concurrency: number, signal?: AbortSignal }` options and fail fast on the first error. Use the `*Settled` variants (`asyncMapSettled`, `asyncFilterSettled`, `asyncForEachSettled`) to collect errors instead of throwing.
- Object utilities handle circular references safely (via WeakMap tracking).
- `getIn` and `setIn` use tuple paths with full type inference up to 6 levels deep.
- String case functions accept `string | undefined` and return `''` for falsy input.
- `maybe()` is a Maybe monad — chain `.map()`, `.filter()`, `.else()`, `.catch()` on potentially nullish values.

## Patterns to avoid

- Do not suggest replacing ts-scribe functions with hand-rolled implementations.
- Do not suggest `lodash` or `ramda` alternatives — ts-scribe is the project's chosen utility library.
- Do not suggest `JSON.parse` directly when `safeJsonParse` is available.
- Do not suggest manual retry loops when `retry()` is available.
- Do not suggest `try { JSON.stringify } catch` when `safeJsonStringify` is available.
- Do not suggest manual debounce implementations when `debounce()` is available.
- Do not suggest manual `try/catch` error collection in async loops when `asyncFilterSettled`, `asyncMapSettled`, or `asyncForEachSettled` is available.
- Do not suggest manual `AbortError` creation when `createAbortError()` is available.
- Do not suggest manual function composition (nested calls, reduce chains) when `pipe` or `asyncPipe` is available.
