type Entry<T> = {
  data: T;
  weightIndex: number;
  weight: number;
};

type InputEntry<T> = {
  data: T;
  weight: number;
};

/**
 * A WeightedList can be used as an easy way to calculate probabilities based on weights, relative to other items inside the list.
 */
export class WeightedList<T> {
  private entries: Entry<T>[] = [];
  private totalWeight = 0.0;
  length = 0;

  /**
   * Optionally merge with an existing WeightedList.
   * @param list An existing WeightedList to merge with, if provided.
   */
  constructor(list?: WeightedList<T>) {
    if (list !== undefined) {
      this.entries = [...list.entries];
      this.totalWeight = list.totalWeight;
      this.length = this.entries.length;
    }
  }

  /**
   * Add a new object with its associated weight.
   * @param data The object to put into the list.
   * @param weight A number that defines its weight inside the list, used to calculate probabilities.
   */
  push(data: T, weight: number) {
    this.totalWeight += weight;
    this.entries.push({
      data: data,
      weightIndex: this.totalWeight,
      weight: weight,
    });
    this.length++;
  }

  /**
   * Get a random object from the list based on its weight.
   * The higher the weight, the more likely it will be chosen.
   * @returns A random object from the list or null if the list is empty.
   */
  random(): T | null {
    if (this.entries.length == 0) return null;
    const r = Math.random() * this.totalWeight;

    const res = this.entries.find(function (entry) {
      return entry.weightIndex >= r;
    });
    return res?.data || null;
  }

  /**
   * Returns all objects inside the list.
   * @returns An array of all objects in the list.
   */
  values() {
    return this.entries.map((val) => {
      return val.data;
    });
  }

  /**
   * Returns a list of all objects and their associated weights.
   * @returns An array of objects and their weights.
   */
  weights(): InputEntry<T>[] {
    return this.entries.map((val) => {
      return { data: val.data, weight: val.weight };
    });
  }

  /**
   * Returns the total weight of all items inside the list.
   * @returns The total weight of all items.
   */
  getTotalWeight() {
    return this.totalWeight;
  }

  /**
   * Returns the probability of a specific item inside the list based on its weight.
   * @param index The index of the item.
   * @returns The probability of the item, or null if the index is invalid.
   */
  probability(index: number) {
    const item = this.entries.at(index);
    if (item === undefined) return null;
    return item.weight / this.totalWeight;
  }

  /**
   * Returns and removes a random item from the list based on its weight.
   * @returns The item and its weight, or null if the list is empty.
   */
  popRandom(): InputEntry<T> | null {
    if (this.entries.length == 0) return null;

    const r = Math.random() * this.totalWeight;
    const index = this.entries.findIndex(function (entry) {
      return entry.weightIndex >= r;
    });
    const result = this.entries.at(index);
    if (result === undefined) return null;

    this.entries.splice(index, 1);
    this.length--;

    this.totalWeight -= result.weight;
    return { data: result.data, weight: result.weight };
  }

  /**
   * Remove all items from the list and reset it.
   */
  clear() {
    this.entries = [];
    this.totalWeight = 0;
    this.length = 0;
  }

  /**
   * Returns a string representation of the WeightedList.
   * @returns A string summarizing the list, including length, total weight, and item details.
   */
  toString(): string {
    let formatted = `{\n\tlength: ${this.length},\n\ttotalWeight: ${this.totalWeight},\n\titems: [\n`;
    formatted += this.entries.map((val) => {
      return `\t\t{\n\t\t\tobject: ${val.data}\n\t\t\tweight: ${val.weight}\n\t\t}`;
    });
    formatted += '\n\t]\n}';
    return formatted;
  }
}
