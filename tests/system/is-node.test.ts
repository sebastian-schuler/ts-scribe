import { describe, expect, it } from 'bun:test';
import { isNode } from '../../src/system/index.js';

describe('isNode', () => {
  it('should return true if running in a Node.js environment', () => {
    // Simulate Node.js environment
    const originalProcess = global.process;
    // @ts-expect-error simulate node env
    global.process = { versions: { node: '14.0.0' } };

    expect(isNode()).toBe(true);

    // Restore original process object
    global.process = originalProcess;
  });

  it('should return false if process is undefined', () => {
    // Simulate non-Node.js environment
    const originalProcess = global.process;
    // @ts-expect-error simulate node env
    delete global.process;

    expect(isNode()).toBe(false);

    // Restore original process object
    global.process = originalProcess;
  });

  it('should return false if process.versions is undefined', () => {
    // Simulate non-Node.js environment
    const originalProcess = global.process;
    // @ts-expect-error simulate node env
    global.process = {};

    expect(isNode()).toBe(false);

    // Restore original process object
    global.process = originalProcess;
  });

  it('should return false if process.versions.node is undefined', () => {
    // Simulate non-Node.js environment
    const originalProcess = global.process;
    // @ts-expect-error simulate node env
    global.process = { versions: {} };

    expect(isNode()).toBe(false);

    // Restore original process object
    global.process = originalProcess;
  });
});
