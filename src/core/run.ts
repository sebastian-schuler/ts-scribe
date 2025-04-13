/**
 * Helper function to execute a block of code or function in a cleaner and more concise way.
 * It allows for simpler usage of Immediately Invoked Function Expressions (IIFE) or simplifying complex code with `do` expressions.
 *
 * ---
 *
 * Example as an IIFE:
 * ```ts
 * // BEFORE: Normal IIFE
 * (async () => {
 *    console.log("Lots of parens");
 * })();
 *
 * // AFTER: With run
 * run(async () => {
 *     console.log("That's better. Great for bin scripts!");
 * });
 * ```
 * ---
 * Example as a `do` expression:
 * ```ts
 * // BEFORE: let declaration and manual assignment
 * function doWork() {
 *   let x;
 *   if (foo()) x = f();
 *   else if (bar()) x = g();
 *   else x = h();
 *   return x * 10;
 * }
 *
 * // AFTER: using run to simplify variable assignment
 * function doWork() {
 *   const x = run(() => {
 *     if (foo()) return f();
 *     else if (bar()) return g();
 *     else return h();
 *   });
 *
 *   return x * 10;
 * }
 * ```
 *
 * ---
 *
 * @param {() => T} fn - The function or block of code to execute.
 * @returns {T} The return value of the provided function.
 *
 * @example
 * run(() => 42); // Returns 42
 * run(() => { return "Hello, world!"; }); // Returns "Hello, world!"
 */
export function run<T>(fn: () => T): T {
  return fn();
}
