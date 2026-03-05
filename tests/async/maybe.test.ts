import { jest, describe, it, expect } from 'bun:test';
import { maybe } from '../../src/async/index.js';

describe('maybe', () => {
	it('should return empty', () => {
		const test = maybe.empty();
		expect(test.ok).toBe(false);
		expect(test.empty).toBe(true);
		expect(test.error).toBe(null);
		expect(() => test.value).toThrow();
		expect(maybe(null)).toBe(test);
		expect(maybe(undefined)).toBe(test);
		expect(maybe.empty()).toBe(test);
		expect(test.catch(() => 1)).toBe(test);
		expect(test.else(() => 1).value).toBe(1);
		expect(test.map(() => 1)).toBe(test);
		expect(test.toArray()).toEqual([]);

		const callback = jest.fn((tt: any) => {
			return tt;
		});
		expect(test.filter(callback)).toBe(test);
		expect(callback).not.toBeCalled();
	});

	it('should return an error', () => {
		const error = new Error('error');
		let test = maybe.error(error);
		expect(test.ok).toBe(false);
		expect(test.empty).toBe(true);
		expect(test.error).toBe(error);
		expect(() => test.value).toThrow(error);
		expect(maybe.error(error) !== test).toBeTruthy();
		expect(test.catch(() => 1).value).toBe(1);
		expect(test.toArray()).toEqual([]);

		const callback = jest.fn((tt: any) => {
			return tt;
		});
		expect(test.else(callback)).toBe(test);
		expect(test.filter(callback)).toBe(test);
		expect(test.map(callback)).toBe(test);
		expect(callback).not.toBeCalled();

		test = maybe(() => {
			throw error;
		});
		expect(test.ok).toBe(false);
		expect(test.empty).toBe(true);
		expect(test.error).toBe(error);
		expect(() => test.value).toThrow(error);

		test = maybe.error();
		expect(test.ok).toBe(false);
		expect(test.empty).toBe(true);
		expect(test.error).toBeInstanceOf(Error);
		expect(test.error).toEqual(
			expect.objectContaining({
				message: 'unknown',
			}),
		);
		expect(() => test.value).toThrow(test.error as any);
	});

	it('should return ok', () => {
		const getAsync = () => {
			return ['sadasdasd'];
		};

		const mby = maybe(getAsync())
			.filter((ddd) => ddd.length <= 3)
			.catch(() => {
				console.log('error');
			});
		expect(mby.ok).toBe(true);
		expect(mby.value.at(0)).toBe('sadasdasd');

		const test = maybe(1);
		expect(test.ok).toBe(true);
		expect(test.empty).toBe(false);
		// @ts-expect-error - value should be number
		expect(test.error).toBe(undefined);
		expect(test.value).toBe(1);
		expect(maybe(1)).not.toBe(test);
		expect(test.filter(() => true)).toBe(test);
		expect(test.filter(() => false)).toBe(maybe.empty());
		expect(test.map((value) => value + 2).value).toBe(3);
		expect(test.toArray()).toEqual([1]);

		const callback = jest.fn();
		expect(test.catch(callback)).toBe(test);
		expect(test.else(callback)).toBe(test);
		expect(callback).not.toBeCalled();
	});

	it('should chain map operations', () => {
		const result = maybe(5)
			.map((v) => v * 2)
			.map((v) => v + 3);
		expect(result.ok).toBe(true);
		expect(result.value).toBe(13);

		// map on empty should return empty
		const result2 = maybe.empty()
			.map((v: any) => v * 2)
			.map((v: any) => v + 3);
		expect(result2.ok).toBe(false);
		expect(result2.empty).toBe(true);
	});

	it('should chain filter operations', () => {
		const result = maybe(10)
			.filter((v) => v > 5)
			.filter((v) => v < 20);
		expect(result.ok).toBe(true);
		expect(result.value).toBe(10);

		// filter that fails
		const result2 = maybe(10)
			.filter((v) => v > 5)
			.filter((v) => v < 8);
		expect(result2.ok).toBe(false);
		expect(result2.empty).toBe(true);
	});

	it('should chain map and filter', () => {
		const result = maybe(5)
			.map((v) => v * 2)
			.filter((v) => v > 5);
		expect(result.ok).toBe(true);
		expect(result.value).toBe(10);

		const result2 = maybe(2)
			.map((v) => v * 2)
			.filter((v) => v > 10);
		expect(result2.ok).toBe(false);
	});

	it('should handle error in map callback', () => {
		const error = new Error('map failed');
		const result = maybe(5).map(() => {
			throw error;
		});
		expect(result.ok).toBe(false);
		expect(result.error).toBe(error);
	});

	it('should handle error in filter callback', () => {
		const error = new Error('filter failed');
		const result = maybe(5).filter(() => {
			throw error;
		});
		expect(result.ok).toBe(false);
		expect(result.error).toBe(error);
	});

	it('should handle error in catch callback', () => {
		const catchError = new Error('catch failed');
		const result = maybe.error(new Error('original')).catch(() => {
			throw catchError;
		});
		expect(result.ok).toBe(false);
		expect(result.error).toBe(catchError);
	});

	it('should handle nested maybe values', () => {
		const result = maybe(() => maybe(42));
		// When a factory returns a maybe, it gets unwrapped
		expect(result.ok).toBe(true);
		expect(result.value).toBe(42);

		const result2 = maybe(() => maybe.empty());
		expect(result2.ok).toBe(false);
	});

	it('should handle factory returning null/undefined', () => {
		const result = maybe(() => null);
		expect(result.ok).toBe(false);

		const result2 = maybe(() => undefined);
		expect(result2.ok).toBe(false);
	});

	it('should transition from ok to empty and back', () => {
		const result = maybe(5)
			.filter((v) => v > 10) // becomes empty
			.else(() => 20)
			.map((v) => v + 5);
		expect(result.ok).toBe(true);
		expect(result.value).toBe(25);
	});

	it('should handle else with different input types', () => {
		// else with value
		const result1 = maybe.empty().else(100);
		expect(result1.ok).toBe(true);
		expect(result1.value).toBe(100);

		// else with function that returns value
		const result2 = maybe.empty().else(() => 200);
		expect(result2.ok).toBe(true);
		expect(result2.value).toBe(200);

		// else with function that returns maybe
		const result3 = maybe.empty().else(() => maybe(300));
		expect(result3.ok).toBe(true);
		// @ts-expect-error - value should be number
		expect(result3.value).toBe(300);

		// else with function that returns null
		const result4 = maybe.empty().else(() => null);
		expect(result4.ok).toBe(false);
	});

	it('should work with complex value types', () => {
		// Array values
		const arrayMaybe = maybe([1, 2, 3]);
		expect(arrayMaybe.ok).toBe(true);
		expect(arrayMaybe.value).toEqual([1, 2, 3]);

		// Object values
		const objMaybe = maybe({ name: 'test', id: 1 });
		expect(objMaybe.ok).toBe(true);
		expect(objMaybe.value).toEqual({ name: 'test', id: 1 });

		// Functions are treated as factories, not values
		const fn = () => 'hello';
		const fnMaybe = maybe(fn);
		expect(fnMaybe.ok).toBe(true);
		expect(fnMaybe.value).toBe('hello'); // factory was called
	});

	it('should handle error recovery with catch', () => {
		const result = maybe.error(new Error('first'))
			.catch((error) => {
				expect(error).toBeInstanceOf(Error);
				return 'recovered';
			})
			.map((v) => v + '!');
		expect(result.ok).toBe(true);
		expect(result.value).toBe('recovered!');
	});

	it('should not call callbacks when not applicable', () => {
		const mapFn = jest.fn();
		const filterFn = jest.fn();
		const elseFn = jest.fn();
		const catchFn = jest.fn();

		// on ok value, else and catch should not be called
		maybe(5)
			.else(elseFn)
			.catch(catchFn);

		expect(elseFn).not.toBeCalled();
		expect(catchFn).not.toBeCalled();

		// on error, if catch returns a value, else should not be called
		const catchFn2 = jest.fn(() => 'recovered');
		const elseFn2 = jest.fn();
		maybe.error(new Error('test'))
			.catch(catchFn2)
			.else(elseFn2);

		expect(catchFn2).toBeCalled();
		expect(elseFn2).not.toBeCalled();
	});

	it('should preserve empty singleton across calls', () => {
		const empty1 = maybe.empty();
		const empty2 = maybe(null);
		const empty3 = maybe(undefined);
		const empty4 = maybe.empty();

		// @ts-expect-error - accessing private symbol
		expect(empty1).toBe(empty2);
		expect(empty2).toBe(empty3);
		expect(empty3).toBe(empty4);
	});

	it('should create new error instances', () => {
		const error1 = maybe.error();
		const error2 = maybe.error();

		expect(error1).not.toBe(error2);
		expect(error1.ok).toBe(error2.ok);
		expect(error1.error).not.toBe(error2.error);
	});

	it('should create new ok instances', () => {
		const ok1 = maybe(42);
		const ok2 = maybe(42);

		expect(ok1).not.toBe(ok2);
		expect(ok1.value).toBe(ok2.value);
	});

	it('should have access to maybe symbol', () => {
		const test = maybe(5);
		// @ts-expect-error - accessing private symbol
		expect(test[Symbol.for('@@maybe')]).toBe(test);
	});

	it('should work with falsy values', () => {
		// 0 is a valid value
		const zero = maybe(0);
		expect(zero.ok).toBe(true);
		expect(zero.value).toBe(0);

		// false is a valid value
		const falseMaybe = maybe(false);
		expect(falseMaybe.ok).toBe(true);
		expect(falseMaybe.value).toBe(false);

		// empty string is a valid value
		const emptyString = maybe('');
		expect(emptyString.ok).toBe(true);
		expect(emptyString.value).toBe('');
	});

	it('should handle type narrowing with filter', () => {
		const value: string | number = 'hello';
		const result = maybe(value).filter((v): v is string => typeof v === 'string');
		expect(result.ok).toBe(true);
		expect(result.value).toBe('hello');

		const value2: string | number = 42;
		// @ts-expect-error - value2 should be narrowed to string
		const result2 = maybe(value2).filter((v): v is string => typeof v === 'string');
		expect(result2.ok).toBe(false);
	});

	it('should handle complex chaining scenarios', () => {
		const result = maybe({ value: 10 })
			.map((obj) => obj.value)
			.map((v) => v * 2)
			.filter((v) => v > 15)
			.map((v) => `value: ${v}`)
			.else('default');

		expect(result.ok).toBe(true);
		expect(result.value).toBe('value: 20');

		const result2 = maybe({ value: 3 })
			.map((obj) => obj.value)
			.map((v) => v * 2)
			.filter((v) => v > 15) // fails
			.else('default');

		expect(result2.ok).toBe(true);
		expect(result2.value).toBe('default');
	});
});
