// @ts-nocheck

import { describe, expect, it } from 'bun:test';
import { isBrowser } from '../../src/system';

describe('isBrowser', () => {
  it('should return true if running in a browser environment', () => {
    // Simulate browser environment
    global.window = {};
    global.document = {};

    expect(isBrowser()).toBe(true);

    // Clean up
    delete global.window;
    delete global.document;
  });

  it('should return false if window is undefined', () => {
    // Simulate non-browser environment
    global.document = {};

    expect(isBrowser()).toBe(false);

    // Clean up
    delete global.document;
  });

  it('should return false if document is undefined', () => {
    // Simulate non-browser environment
    global.window = {};

    expect(isBrowser()).toBe(false);

    // Clean up
    delete global.window;
  });

  it('should return false if both window and document are undefined', () => {
    // Simulate non-browser environment
    expect(isBrowser()).toBe(false);
  });
});
