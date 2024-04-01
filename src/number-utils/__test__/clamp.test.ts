import { describe, expect, it } from '@jest/globals';
import { clamp } from '../clamp';

describe('Fn: clamp', () => {
  it('it should clamp the value between the min and max', () => {
    expect(clamp(13, 1, 10)).toBe(10);
    expect(clamp(13, 1, 20)).toBe(13);
    expect(clamp(13, 15, 20)).toBe(15);
  });
});
