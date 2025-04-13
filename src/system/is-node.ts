/**
 * Determines whether the current environment is Node.js.
 *
 * Checks for the presence of the `process` object and its `versions.node` property,
 * which are specific to the Node.js runtime.
 *
 * @returns {boolean} `true` if running in a Node.js environment, otherwise `false`.
 *
 * @example
 * isNode(); // true in Node.js, false in browsers or other non-Node environments
 */
export const isNode = (): boolean =>
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
