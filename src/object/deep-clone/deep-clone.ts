import { rfdc } from './rfdc.js';

type Options = {
  circleRefs?: boolean;
  protoProps?: boolean;
};

/**
 * Deep clones an object, optionally maintaining circular references and cloning prototype properties.
 *
 * This function creates a deep copy of the provided object. It can also preserve circular references
 * and include prototype properties in the cloned object, based on the provided options.
 *
 * ---
 * Example:
 * ```ts
 * const obj = { a: 1, b: { c: 2 } };
 * const clone = objectDeepClone(obj);
 * console.log(clone); // { a: 1, b: { c: 2 } }
 * ```
 *
 * @param {T} obj - The object to deep clone.
 * @param {Options} [options] - Optional configuration options for the cloning process:
 *   - `circleRefs` (boolean): Whether to preserve circular references in the object. Default is `false`.
 *   - `protoProps` (boolean): Whether to clone prototype properties of the object. Default is `false`.
 *
 * @returns {T} A deep clone of the input object, with the specified options applied.
 *
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 * const clonedObj = objectDeepClone(obj, { circleRefs: true, protoProps: true });
 * console.log(clonedObj); // A deep clone with the same structure and prototype properties.
 */
export function objectDeepClone<T>(obj: T, options?: Options): T {
  return rfdc({
    circles: options?.circleRefs ?? false,
    proto: options?.protoProps ?? false,
  })(obj);
}
