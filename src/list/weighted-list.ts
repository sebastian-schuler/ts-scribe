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
 * @category List
 */
export class WeightedList<T> {
	public length = 0;

	private entries: Array<Entry<T>> = [];
	private totalWeight = 0;

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
	 * Add one or more objects with their associated weights.
	 * @param items One or more objects with their weights to add to the list.
	 */
	push(...items: Array<InputEntry<T>>) {
		for (const item of items) {
			this.totalWeight += item.weight;
			this.entries.push({
				data: item.data,
				weightIndex: this.totalWeight,
				weight: item.weight,
			});
			this.length++;
		}
	}

	/**
	 * Get a random object from the list based on its weight.
	 * The higher the weight, the more likely it will be chosen.
	 * @returns A random object from the list or undefined if the list is empty.
	 */
	random(): T | undefined {
		if (this.entries.length === 0) return undefined;
		const r = Math.random() * this.totalWeight;

		const foundEntry = this.entries.find(function (entry) {
			return entry.weightIndex >= r;
		});

		return foundEntry?.data ?? undefined;
	}

	/**
	 * Returns all objects inside the list.
	 * @returns An array of all objects in the list.
	 */
	values() {
		return this.entries.map((value) => {
			return value.data;
		});
	}

	/**
	 * Returns a list of all objects and their associated weights.
	 * @returns An array of objects and their weights.
	 */
	weights(): Array<InputEntry<T>> {
		return this.entries.map((value) => {
			return { data: value.data, weight: value.weight };
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
	 * @returns The probability of the item, or undefined if the index is invalid.
	 */
	probability(index: number) {
		const item = this.entries.at(index);
		if (item === undefined) return undefined;
		return item.weight / this.totalWeight;
	}

	/**
	 * Returns and removes a random item from the list based on its weight.
	 * @returns The item and its weight, or undefined if the list is empty.
	 */
	popRandom(): InputEntry<T> | undefined {
		if (this.entries.length === 0) return undefined;

		const r = Math.random() * this.totalWeight;
		const index = this.entries.findIndex(function (entry) {
			return entry.weightIndex >= r;
		});
		const result = this.entries.at(index);
		if (result === undefined) return undefined;

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

		formatted += this.entries
			.map((value) => {
				return `\t\t{\n\t\t\tobject: ${String(value.data)}\n\t\t\tweight: ${value.weight}\n\t\t}`;
			})
			.join(',\n');

		formatted += '\n\t]\n}';

		return formatted;
	}
}
