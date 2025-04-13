import { describe, expect, it } from 'bun:test';
import { isBrowser } from '../../src/system/index.js';

describe('isBrowser', () => {
  it('should return true if running in a browser environment', () => {
    // Simulate browser environment

    // @ts-expect-error simulate browser env
    global.window = {};
    // @ts-expect-error simulate browser env
    global.document = {};

    expect(isBrowser()).toBe(true);

    // Clean up
    // @ts-expect-error simulate browser env
    delete global.window;
    // @ts-expect-error simulate browser env
    delete global.document;
  });

  it('should return false if window is undefined', () => {
    // Simulate non-browser environment
    // @ts-expect-error simulate browser env
    global.document = {};

    expect(isBrowser()).toBe(false);

    // Clean up
    // @ts-expect-error simulate browser env
    delete global.document;
  });

  it('should return false if document is undefined', () => {
    // Simulate non-browser environment
    // @ts-expect-error simulate browser env
    global.window = {};

    expect(isBrowser()).toBe(false);

    // Clean up
    // @ts-expect-error simulate browser env
    delete global.window;
  });

  it('should return false if both window and document are undefined', () => {
    // Simulate non-browser environment
    expect(isBrowser()).toBe(false);
  });
});
