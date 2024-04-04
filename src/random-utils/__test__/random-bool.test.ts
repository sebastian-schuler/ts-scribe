import { randomBool } from '../random-bool';

describe('randomBool', () => {
  // Test case for default probability
  it('should return true or false with approximately equal probability when no probability is provided', () => {
    const numIterations = 1000;
    let trueCount = 0;
    let falseCount = 0;
    for (let i = 0; i < numIterations; i++) {
      if (randomBool()) {
        trueCount++;
      } else {
        falseCount++;
      }
    }
    // Check if approximately equal number of true and false values are returned
    expect(trueCount).toBeGreaterThan(0);
    expect(falseCount).toBeGreaterThan(0);
    expect(Math.abs(trueCount - falseCount)).toBeLessThanOrEqual(numIterations * 0.1); // Allow a 10% margin of error
  });

  // Test case for custom probability
  it('should return true with probability equal to the provided probability', () => {
    const probability = 0.7;
    const numIterations = 1000;
    let trueCount = 0;
    for (let i = 0; i < numIterations; i++) {
      if (randomBool(probability)) {
        trueCount++;
      }
    }
    const observedProbability = trueCount / numIterations;
    // Check if observed probability is close to the provided probability
    expect(observedProbability).toBeCloseTo(probability, 1); // Allow a 1% margin of error
  });
});
