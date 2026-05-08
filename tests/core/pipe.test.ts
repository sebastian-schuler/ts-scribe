import { describe, expect, it } from 'bun:test';
import { pipe } from '../../src/core/index.js';

describe('pipe', () => {
	// --- Basic functionality ---

	it('returns identity when called with zero arguments', () => {
		const id = pipe();

		expect(id(42)).toBe(42);
		expect(id('hello')).toBe('hello');
		expect(id({ a: 1 })).toEqual({ a: 1 });
	});

	it('returns the function itself when called with one argument', () => {
		const double = (n: number) => n * 2;
		const result = pipe(double);

		expect(result).toBe(double);
		expect(result(5)).toBe(10);
	});

	it('composes two functions left-to-right', () => {
		const add1 = (n: number) => n + 1;
		const double = (n: number) => n * 2;
		const add1ThenDouble = pipe(add1, double);

		expect(add1ThenDouble(3)).toBe(8); // (3+1)*2
	});

	it('composes three functions left-to-right', () => {
		const add1 = (n: number) => n + 1;
		const double = (n: number) => n * 2;
		const toString = (n: number) => String(n);
		const pipeline = pipe(add1, double, toString);

		expect(pipeline(3)).toBe('8');
	});

	it('composes four functions left-to-right', () => {
		const add1 = (n: number) => n + 1;
		const double = (n: number) => n * 2;
		const square = (n: number) => n * n;
		const toString = (n: number) => String(n);
		const pipeline = pipe(add1, double, square, toString);

		expect(pipeline(2)).toBe('36'); // ((2+1)*2)^2 = 36
	});

	it('composes six functions left-to-right', () => {
		const fns = [
			(n: number) => n + 1,
			(n: number) => n * 2,
			(n: number) => n - 1,
			(n: number) => n * 3,
			(n: number) => n + 5,
			(n: number) => String(n),
		] as const;
		const pipeline = pipe(fns[0], fns[1], fns[2], fns[3], fns[4], fns[5]);

		// ((1+1)*2-1)*3+5 = (4-1)*3+5 = 9+5 = 14
		expect(pipeline(1)).toBe('14');
	});

	// --- Order verification ---

	it('executes functions in left-to-right order', () => {
		const calls: string[] = [];
		const a = (x: string) => {
			calls.push('a');
			return x + 'a';
		};

		const b = (x: string) => {
			calls.push('b');
			return x + 'b';
		};

		const c = (x: string) => {
			calls.push('c');
			return x + 'c';
		};

		const result = pipe(a, b, c)('');
		expect(calls).toEqual(['a', 'b', 'c']);
		expect(result).toBe('abc');
	});

	// --- Error propagation ---

	it('propagates errors thrown by a function in the pipeline', () => {
		const add1 = (n: number) => n + 1;
		const explode = (_n: number): number => {
			throw new Error('boom');
		};

		const pipeline = pipe(add1, explode);

		expect(() => pipeline(1)).toThrow('boom');
	});

	it('stops execution after the first error', () => {
		const calls: string[] = [];
		const a = (x: number) => {
			calls.push('a');
			return x + 1;
		};

		const b = (_x: number): number => {
			calls.push('b');
			throw new Error('fail');
		};

		const c = (x: number) => {
			calls.push('c');
			return x + 1;
		};

		const pipeline = pipe(a, b, c);
		expect(() => pipeline(0)).toThrow('fail');
		expect(calls).toEqual(['a', 'b']); // c never called
	});

	it('propagates error when the first function throws', () => {
		const explode = (_x: number): number => {
			throw new Error('first fails');
		};

		const add1 = (n: number) => n + 1;
		const pipeline = pipe(explode, add1);

		expect(() => pipeline(1)).toThrow('first fails');
	});

	it('propagates non-Error throws through the pipeline', () => {
		const throwString = (_x: number): number => {
			throw 'string error';
		};

		const pipeline = pipe(throwString);

		expect(() => pipeline(1)).toThrow('string error');
	});

	// --- Type transformations ---

	it('handles type transformations across the pipeline', () => {
		const numToStr = (n: number) => String(n);
		const strToLen = (s: string) => s.length;
		const lenToBool = (n: number) => n > 0;
		const pipeline = pipe(numToStr, strToLen, lenToBool);

		expect(pipeline(123)).toBe(true); // '123'.length = 3 > 0
		expect(pipeline(0)).toBe(true); // '0'.length = 1 > 0
	});

	// --- Integration with ts-scribe functions ---

	it('works with string transformation functions', () => {
		const trim = (s: string) => s.trim();
		const lower = (s: string) => s.toLowerCase();
		const pipeline = pipe(trim, lower);

		expect(pipeline('  Hello WORLD  ')).toBe('hello world');
	});

	it('works with number transformations', () => {
		const add5 = (n: number) => n + 5;
		const clamp0to10 = (n: number) => Math.min(10, Math.max(0, n));
		const pipeline = pipe(add5, clamp0to10);

		expect(pipeline(3)).toBe(8);
		expect(pipeline(8)).toBe(10);
		expect(pipeline(-10)).toBe(0);
	});

	// --- Edge cases ---

	it('passes undefined through the pipeline', () => {
		const id = (x: any) => x;
		const pipeline = pipe(id, id);

		expect(pipeline(undefined)).toBeUndefined();
	});

	it('passes null through the pipeline', () => {
		const id = (x: any) => x;
		const pipeline = pipe(id, id);

		expect(pipeline(null)).toBeNull();
	});

	it('passes objects through the pipeline', () => {
		const addField = (obj: { a: number }) => ({ ...obj, b: 2 } as const);
		const pipeline = pipe(addField);

		expect(pipeline({ a: 1 })).toEqual({ a: 1, b: 2 });
	});

	// --- Coverage: chain lengths ---

	it('composes five functions left-to-right', () => {
		const fns = [
			(n: number) => n + 1,
			(n: number) => n * 2,
			(n: number) => n - 1,
			(n: number) => n * 3,
			(n: number) => String(n),
		] as const;
		const pipeline = pipe(fns[0], fns[1], fns[2], fns[3], fns[4]);

		// ((1+1)*2-1)*3 = 9
		expect(pipeline(1)).toBe('9');
	});

	it('composes seven functions via the fallback path', () => {
		const pipeline = pipe(
			(n: number) => n + 1,
			(n: number) => n * 2,
			(n: number) => n - 1,
			(n: number) => n * 3,
			(n: number) => n + 5,
			(n: number) => n - 2,
			(n: number) => String(n),
		);

		// ((1+1)*2-1)*3+5-2 = 12
		expect(pipeline(1)).toBe('12');
	});

	// --- Coverage: special values ---

	it('passes NaN through the pipeline', () => {
		const id = (x: any) => x;
		const pipeline = pipe(id, id);

		expect(Number.isNaN(pipeline(NaN))).toBe(true);
	});

	it('passes Infinity through the pipeline', () => {
		const add1 = (n: number) => n + 1;
		const pipeline = pipe(add1);

		expect(pipeline(Infinity)).toBe(Infinity);
		expect(pipeline(-Infinity)).toBe(-Infinity);
	});

	// --- Promise passthrough (pipe does NOT await) ---

	it('passes a Promise through as-is without awaiting', () => {
		const returnPromise = (n: number) => Promise.resolve(n * 2);
		const inspect = (x: unknown) => {
			expect(x).toBeInstanceOf(Promise);
			return x;
		};

		const pipeline = pipe(returnPromise, inspect);

		const result = pipeline(5);
		// The final return is still a Promise (the one from returnPromise),
		// not double-wrapped — pipe just threads values.
		expect(result).toBeInstanceOf(Promise);
	});
});
