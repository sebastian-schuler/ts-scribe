import { WeightedList } from '../../src/list';

describe('WeightedList', () => {
  let weightedList: WeightedList<string>;

  beforeEach(() => {
    weightedList = new WeightedList();
  });

  afterEach(() => {
    weightedList.clear();
  });

  it('should add items correctly', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    expect(weightedList.length).toBe(2);
    expect(weightedList.getTotalWeight()).toBe(5);
  });

  it('should return null when random is called on an empty list', () => {
    expect(weightedList.random()).toBeNull();
  });

  it('should return a random item based on weights', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    const randomItem = weightedList.random();
    expect(randomItem).toBeDefined();
    expect(randomItem).toMatch(/item1|item2/);
  });

  it('should return all items', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    expect(weightedList.values()).toEqual(['item1', 'item2']);
  });

  it('should return all items with their weights', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    expect(weightedList.weights()).toEqual([
      { data: 'item1', weight: 2 },
      { data: 'item2', weight: 3 },
    ]);
  });

  it('should return the correct probability of an item', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    expect(weightedList.probability(0)).toBe(2 / 5);
    expect(weightedList.probability(1)).toBe(3 / 5);
  });

  it('should return and remove a random item', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    const randomItem = weightedList.popRandom();
    expect(randomItem).toBeDefined();
    expect(weightedList.length).toBe(1);
  });

  it('should clear all items', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    weightedList.clear();
    expect(weightedList.length).toBe(0);
    expect(weightedList.getTotalWeight()).toBe(0);
  });

  it('should return a string representation', () => {
    weightedList.push('item1', 2);
    weightedList.push('item2', 3);
    const strRepresentation = weightedList.toString();
    expect(strRepresentation).toMatch(/length: 2/);
    expect(strRepresentation).toMatch(/totalWeight: 5/);
    expect(strRepresentation).toMatch(
      /items: \[\s+{\s+object: item1\s+weight: 2\s+},\s+{\s+object: item2\s+weight: 3\s+}\s+\]/,
    );
  });
});
