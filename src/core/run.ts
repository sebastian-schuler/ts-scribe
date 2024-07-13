/**
 * Helper to run a function or block of code in a cleaner way
 * 
 * ---
 * 
 * Example as an IIFE:
 * ```ts
//BEFORE: Normal IIFE
(async () => {
   console.log("Lots of parens");
})();
 
// AFTER: With run
run(async () => {
    console.log("That's better. Great for bin scripts!");
});
 * ```
 * ---
 * Example as a do expression:
 * ```ts
// BEFORE: let declaration and manual assignment
function doWork() {
  let x;
  if (foo()) x = f();
  else if (bar()) x = g();
  else x = h()
  return x * 10;
}

// AFTER: using run to simplify variable assignment
function doWork() {
  const x = run(() => {
    if (foo()) return f();
    else if (bar()) return g();
    else return h();
  });

  return x * 10;
}
 * ```
 */
export function run<T>(fn: () => T): T {
  return fn();
}
