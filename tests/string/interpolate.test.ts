import { describe, expect, it } from 'bun:test';
import { interpolateString } from '../../src/string/index.js';

describe('interpolateString function', () => {
	// ─── Basic named placeholders ────────────────────────────────────────────────

	describe('basic named placeholders', () => {
		it('should replace a single named placeholder', () => {
			expect(interpolateString('Hello, {name}!', { name: 'Alice' })).toBe('Hello, Alice!');
		});

		it('should replace multiple named placeholders', () => {
			expect(interpolateString('{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' })).toBe('Hi, Bob!');
		});

		it('should replace the same placeholder used multiple times', () => {
			expect(interpolateString('{x} and {x} and {x}', { x: 'repeat' })).toBe('repeat and repeat and repeat');
		});

		it('should coerce number values to string', () => {
			expect(interpolateString('Age: {age}', { age: 30 })).toBe('Age: 30');
		});

		it('should coerce boolean values to string', () => {
			expect(interpolateString('Active: {active}', { active: false })).toBe('Active: false');
		});

		it('should return the template unchanged when it has no placeholders', () => {
			expect(interpolateString('No placeholders here.', {})).toBe('No placeholders here.');
		});

		it('should return an empty string when template is undefined', () => {
			expect(interpolateString(undefined, {})).toBe('');
		});

		it('should return an empty string when template is empty', () => {
			expect(interpolateString('', {})).toBe('');
		});

		it('should return a whitespace-only template unchanged', () => {
			expect(interpolateString('   ', {})).toBe('   ');
		});

		it('should trim a single leading space inside a placeholder key', () => {
			expect(interpolateString('Hello, { name}!', { name: 'Carol' })).toBe('Hello, Carol!');
		});

		it('should trim a single trailing space inside a placeholder key', () => {
			expect(interpolateString('Hello, {name }!', { name: 'Carol' })).toBe('Hello, Carol!');
		});

		it('should trim surrounding whitespace around placeholder keys', () => {
			expect(interpolateString('Hello, { name }!', { name: 'Carol' })).toBe('Hello, Carol!');
		});

		it('should trim multiple surrounding spaces around placeholder keys', () => {
			expect(interpolateString('Hello, {  name  }!', { name: 'Carol' })).toBe('Hello, Carol!');
		});

		it('should handle a template that is itself just one placeholder', () => {
			expect(interpolateString('{msg}', { msg: 'hello' })).toBe('hello');
		});

		it('should handle adjacent placeholders with no separator', () => {
			expect(interpolateString('{a}{b}{c}', { a: '1', b: '2', c: '3' })).toBe('123');
		});
	});

	// ─── Value type coercion ─────────────────────────────────────────────────────

	describe('value type coercion', () => {
		it('should coerce an integer number to string', () => {
			expect(interpolateString('n={n}', { n: 42 })).toBe('n=42');
		});

		it('should coerce a floating-point number to string', () => {
			expect(interpolateString('n={n}', { n: 3.14 })).toBe('n=3.14');
		});

		it('should coerce NaN to "NaN"', () => {
			expect(interpolateString('n={n}', { n: Number.NaN })).toBe('n=NaN');
		});

		it('should coerce Infinity to "Infinity"', () => {
			expect(interpolateString('n={n}', { n: Infinity })).toBe('n=Infinity');
		});

		it('should coerce -Infinity to "-Infinity"', () => {
			expect(interpolateString('n={n}', { n: -Infinity })).toBe('n=-Infinity');
		});

		it('should coerce -0 to "0"', () => {
			expect(interpolateString('n={n}', { n: -0 })).toBe('n=0');
		});

		it('should handle a zero value without treating it as falsy', () => {
			expect(interpolateString('Count: {n}', { n: 0 })).toBe('Count: 0');
		});

		it('should handle a false value without treating it as falsy', () => {
			expect(interpolateString('Active: {flag}', { flag: false })).toBe('Active: false');
		});

		it('should coerce a BigInt to string', () => {
			expect(interpolateString('n={n}', { n: 9_007_199_254_740_993n })).toBe('n=9007199254740993');
		});

		it('should coerce a Symbol with a description to its description string', () => {
			expect(interpolateString('s={s}', { s: Symbol('myTag') })).toBe('s=myTag');
		});

		it('should coerce a Symbol without a description to "Symbol()"', () => {
			expect(interpolateString('s={s}', { s: Symbol() })).toBe('s=Symbol()');
		});

		it('should JSON-stringify a plain object value', () => {
			expect(interpolateString('v={v}', { v: { a: 1, b: 'x' } })).toBe('v={"a":1,"b":"x"}');
		});

		it('should JSON-stringify an array value', () => {
			expect(interpolateString('v={v}', { v: [1, 2, 3] })).toBe('v=[1,2,3]');
		});

		it('should handle a numeric string value', () => {
			expect(interpolateString('Value: {n}', { n: '42' })).toBe('Value: 42');
		});

		it('should handle an empty string value', () => {
			expect(interpolateString('[{tag}]', { tag: '' })).toBe('[]');
		});
	});

	// ─── Nested dot-notation paths ───────────────────────────────────────────────

	describe('nested dot-notation paths', () => {
		it('should resolve a single-level nested path', () => {
			expect(interpolateString('{user.name}', { user: { name: 'Dave' } })).toBe('Dave');
		});

		it('should resolve a deeply nested path', () => {
			expect(interpolateString('{a.b.c.d}', { a: { b: { c: { d: 'deep' } } } })).toBe('deep');
		});

		it('should keep the placeholder when the final key in the path is absent', () => {
			expect(interpolateString('{user.missing}', { user: {} })).toBe('{user.missing}');
		});

		it('should keep the placeholder when an intermediate key is absent', () => {
			expect(interpolateString('{a.b.c}', { a: {} })).toBe('{a.b.c}');
		});

		it('should keep the placeholder when an intermediate value is null', () => {
			expect(interpolateString('{a.b}', { a: null })).toBe('{a.b}');
		});

		it('should keep the placeholder when an intermediate value is a primitive', () => {
			expect(interpolateString('{a.b}', { a: 'string' })).toBe('{a.b}');
		});

		it('should resolve array index via dot-notation', () => {
			expect(interpolateString('{items.0}', { items: ['first', 'second'] })).toBe('first');
		});

		it('should resolve nested path on both sides of the same template', () => {
			const data = { user: { first: 'Jane', last: 'Doe' } };
			expect(interpolateString('{user.first} {user.last}', data)).toBe('Jane Doe');
		});
	});

	// ─── Positional (array) placeholders ────────────────────────────────────────

	describe('positional (array) placeholders', () => {
		it('should replace positional placeholders from an array', () => {
			expect(interpolateString('{0} + {1} = {2}', [1, 2, 3])).toBe('1 + 2 = 3');
		});

		it('should replace index 0 correctly', () => {
			expect(interpolateString('{0}', ['zero'])).toBe('zero');
		});

		it('should repeat the same index multiple times', () => {
			expect(interpolateString('{0} and {0}', ['Echo'])).toBe('Echo and Echo');
		});

		it('should keep the placeholder for out-of-range indices', () => {
			expect(interpolateString('{0} and {5}', ['only'])).toBe('only and {5}');
		});

		it('should keep the placeholder for large out-of-range indices', () => {
			expect(interpolateString('{999}', ['only zero'])).toBe('{999}');
		});

		it('should keep the placeholder for a negative index', () => {
			expect(interpolateString('{-1}', ['a', 'b'])).toBe('{-1}');
		});

		it('should keep the placeholder for a float index', () => {
			expect(interpolateString('{1.5}', ['a', 'b'])).toBe('{1.5}');
		});

		it('should keep the placeholder when the array is empty', () => {
			expect(interpolateString('{0}', [])).toBe('{0}');
		});

		it('should keep the placeholder when the slot in the array is undefined', () => {
			// eslint-disable-next-line no-sparse-arrays
			expect(interpolateString('{0} {1} {2}', ['a', undefined, 'c'] as unknown[])).toBe('a {1} c');
		});

		it('should keep the placeholder for an array slot that is null', () => {
			expect(interpolateString('{0} {1}', ['a', null] as unknown[])).toBe('a {1}');
		});
	});

	// ─── Missing keys – default behaviour ───────────────────────────────────────

	describe('missing keys – default behaviour (keep placeholder)', () => {
		it('should keep the original placeholder when key is absent', () => {
			expect(interpolateString('Hi {firstName} {lastName}!', { firstName: 'Eve' })).toBe(
				'Hi Eve {lastName}!',
			);
		});

		it('should keep the placeholder when value is null', () => {
			expect(interpolateString('{value}', { value: null })).toBe('{value}');
		});

		it('should keep the placeholder when value is undefined', () => {
			expect(interpolateString('{value}', { value: undefined })).toBe('{value}');
		});

		it('should keep multiple missing placeholders intact', () => {
			expect(interpolateString('{a} {b} {c}' as string, {})).toBe('{a} {b} {c}');
		});
	});

	// ─── Empty / whitespace-only placeholder keys ────────────────────────────────

	describe('empty and whitespace-only placeholder keys', () => {
		// The regex requires at least one character between delimiters (`+?`),
		// so `{}` (zero-width content) is never matched and is kept verbatim.
		it('should keep {} verbatim because the regex requires at least one inner character', () => {
			expect(interpolateString('{}', { '': 'empty' })).toBe('{}');
		});

		// A single space IS matched; after trimming the key becomes '' which resolves obj[''].
		it('should resolve a single-space key (trimmed to empty string) via the empty-string property', () => {
			expect(interpolateString('{ }', { '': 'trimmed' })).toBe('trimmed');
		});

		it('should keep { } placeholder when data has no empty-string key', () => {
			expect(interpolateString('{ }', {})).toBe('{ }');
		});
	});

	// ─── Fallback option ─────────────────────────────────────────────────────────

	describe('fallback option', () => {
		it('should use a string fallback for missing keys', () => {
			expect(
				interpolateString('Hi {firstName} {lastName}!', { firstName: 'Frank' }, { fallback: '?' }),
			).toBe('Hi Frank ?!');
		});

		it('should use a function fallback receiving the trimmed missing key', () => {
			expect(
				interpolateString(
					'Hi {firstName} {lastName}!',
					{ firstName: 'Grace' },
					{ fallback: (key) => `<${key}>` },
				),
			).toBe('Hi Grace <lastName>!');
		});

		it('should use fallback as empty string to silently remove missing placeholders', () => {
			expect(
				interpolateString('Hello {a}{b}{c}!', { a: 'X' }, { fallback: '' }),
			).toBe('Hello X!');
		});

		it('should use fallback when value is null', () => {
			expect(
				interpolateString('{val}', { val: null }, { fallback: 'N/A' }),
			).toBe('N/A');
		});

		it('should use fallback when value is undefined', () => {
			expect(
				interpolateString('{val}', { val: undefined }, { fallback: 'N/A' }),
			).toBe('N/A');
		});

		it('should call the fallback function once per missing placeholder instance', () => {
			const calls: string[] = [];
			interpolateString('{a} {b} {a}' as string, {}, {
				fallback: (key) => {
					calls.push(key);
					return '?';
				},
			});
			expect(calls).toEqual(['a', 'b', 'a']);
		});

		it('should not use fallback when the key is present', () => {
			expect(
				interpolateString('{name}', { name: 'Heidi' }, { fallback: 'FALLBACK' }),
			).toBe('Heidi');
		});
	});

	// ─── Strict mode ─────────────────────────────────────────────────────────────

	describe('strict mode', () => {
		it('should throw RangeError when a key is missing in strict mode', () => {
			expect(() =>
				interpolateString('Hi {name}!' as string, {}, { strict: true }),
			).toThrow(RangeError);
		});

		it('should throw RangeError for a missing nested path in strict mode', () => {
			expect(() =>
				interpolateString('{user.age}', { user: {} }, { strict: true }),
			).toThrow(RangeError);
		});

		it('should throw when value is null in strict mode', () => {
			expect(() =>
				interpolateString('{val}', { val: null }, { strict: true }),
			).toThrow(RangeError);
		});

		it('should throw with the missing key name in the error message', () => {
			expect(() =>
				interpolateString('Hi {missingKey}!' as string, {}, { strict: true }),
			).toThrow('Missing interpolation key: "missingKey"');
		});

		it('should include the trimmed key in the RangeError message', () => {
			expect(() =>
				interpolateString('Hi { spaced }!' as string, {}, { strict: true }),
			).toThrow('Missing interpolation key: "spaced"');
		});

		it('should not throw when all keys are present in strict mode', () => {
			expect(() =>
				interpolateString('{x}', { x: 1 }, { strict: true }),
			).not.toThrow();
		});

		it('should not throw for a zero value in strict mode', () => {
			expect(interpolateString('{n}', { n: 0 }, { strict: true })).toBe('0');
		});

		it('should not throw for a false value in strict mode', () => {
			expect(interpolateString('{flag}', { flag: false }, { strict: true })).toBe('false');
		});

		it('should throw on the first missing key and stop further processing', () => {
			const calls: string[] = [];
			expect(() =>
				interpolateString('{a} {b} {c}' as string, {}, {
					strict: true,
					transform(v, key) {
						calls.push(key);
						return String(v);
					},
				}),
			).toThrow(RangeError);
			expect(calls).toHaveLength(0);
		});
	});

	// ─── Transform option ─────────────────────────────────────────────────────────

	describe('transform option', () => {
		it('should apply a transform function to each resolved value', () => {
			expect(
				interpolateString('{name}', { name: 'hello' }, { transform: (v) => (v as string).toUpperCase() }),
			).toBe('HELLO');
		});

		it('should pass both value and key to the transform function', () => {
			const collected: Array<[unknown, string]> = [];
			interpolateString('{a} {b}', { a: 1, b: 2 }, {
				transform: (value, key) => {
					collected.push([value, key]);
					return String(value);
				},
			});
			expect(collected).toEqual([[1, 'a'], [2, 'b']]);
		});

		it('should allow transform to return an empty string', () => {
			expect(
				interpolateString('[{a}]', { a: 'x' }, { transform: () => '' }),
			).toBe('[]');
		});

		it('should not call transform for missing keys (fallback path)', () => {
			let transformCalls = 0;
			interpolateString('Hello {name}!' as string, {}, {
				fallback: 'World',
				transform: () => {
					transformCalls++;
					return 'T';
				},
			});
			expect(transformCalls).toBe(0);
		});

		it('should call transform for each of multiple placeholders', () => {
			let calls = 0;
			interpolateString('{a} {b} {c}', { a: 1, b: 2, c: 3 }, {
				transform: (v) => {
					calls++;
					return String(v);
				},
			});
			expect(calls).toBe(3);
		});

		it('should receive the raw (non-string) value in the transform', () => {
			const received: unknown[] = [];
			interpolateString('{n}', { n: 99 }, {
				transform: (v) => {
					received.push(v);
					return String(v);
				},
			});
			expect(received[0]).toBe(99);
		});
	});

	// ─── Custom delimiters ────────────────────────────────────────────────────────

	describe('custom delimiters', () => {
		it('should support double-brace delimiters', () => {
			expect(
				interpolateString('Hello, {{name}}!' as string, { name: 'Hank' }, { open: '{{', close: '}}' }),
			).toBe('Hello, Hank!');
		});

		it('should support percent-sign delimiters', () => {
			expect(
				interpolateString('Hello, %name%!' as string, { name: 'Ivy' }, { open: '%', close: '%' }),
			).toBe('Hello, Ivy!');
		});

		it('should support colon-bracket delimiters', () => {
			expect(
				interpolateString('Hello, :[name]!' as string, { name: 'Jack' }, { open: ':[', close: ']' }),
			).toBe('Hello, Jack!');
		});

		it('should support angle-bracket delimiters', () => {
			expect(
				interpolateString('Hello, <name>!' as string, { name: 'Lena' }, { open: '<', close: '>' }),
			).toBe('Hello, Lena!');
		});

		it('should support dollar-sign + brace delimiters', () => {
			expect(
				interpolateString('Hello, ${name}!' as string, { name: 'Mona' }, { open: '${', close: '}' }),
			).toBe('Hello, Mona!');
		});

		it('should correctly handle regex-special "(" ")" delimiters', () => {
			expect(
				interpolateString('(name)' as string, { name: 'Kim' }, { open: '(', close: ')' }),
			).toBe('Kim');
		});

		it('should correctly handle regex-special "[" "]" delimiters', () => {
			expect(
				interpolateString('[name]' as string, { name: 'Nora' }, { open: '[', close: ']' }),
			).toBe('Nora');
		});

		it('should correctly handle regex-special "." delimiter', () => {
			expect(
				interpolateString('.name.' as string, { name: 'Olga' }, { open: '.', close: '.' }),
			).toBe('Olga');
		});

		it('should not match default {braces} when a non-overlapping custom delimiter is used', () => {
			expect(
				interpolateString('{name} <greeting>' as string, { greeting: 'Hi' }, { open: '<', close: '>' }),
			).toBe('{name} Hi');
		});

		it('should throw an Error when open delimiter is empty', () => {
			expect(() =>
				interpolateString('{name}', { name: 'x' }, { open: '' }),
			).toThrow('Interpolation delimiters must be non-empty strings.');
		});

		it('should throw an Error when close delimiter is empty', () => {
			expect(() =>
				interpolateString('{name}', { name: 'x' }, { close: '' }),
			).toThrow('Interpolation delimiters must be non-empty strings.');
		});
	});

	// ─── Multiline and Unicode ────────────────────────────────────────────────────

	describe('multiline and unicode', () => {
		it('should interpolate across newlines in the template', () => {
			expect(
				interpolateString('Line 1: {a}\nLine 2: {b}', { a: 'hello', b: 'world' }),
			).toBe('Line 1: hello\nLine 2: world');
		});

		it('should support Unicode values', () => {
			expect(interpolateString('{emoji}', { emoji: '🎉' })).toBe('🎉');
		});

		it('should support Unicode placeholder keys (resolved at runtime)', () => {
			expect(interpolateString('{名前}' as string, { '名前': '太郎' })).toBe('太郎');
		});

		it('should handle a template containing emoji outside placeholders', () => {
			expect(interpolateString('👋 {name}!', { name: 'World' })).toBe('👋 World!');
		});

		it('should handle a multiline placeholder key via trimming', () => {
			// The inner content has a newline — after trim() the key becomes 'name'
			expect(interpolateString('{\nname\n}' as string, { name: 'Leo' })).toBe('Leo');
		});
	});

	// ─── Prototype-less objects ───────────────────────────────────────────────────

	describe('prototype-less objects', () => {
		it('should resolve keys on an Object.create(null) data object', () => {
			const bare = Object.create(null) as Record<string, unknown>;
			bare['name'] = 'Zelda';
			expect(interpolateString('{name}', bare)).toBe('Zelda');
		});

		it('should keep the placeholder for a missing key on Object.create(null)', () => {
			const bare = Object.create(null) as Record<string, unknown>;
			expect(interpolateString('{name}', bare)).toBe('{name}');
		});
	});

	// ─── Keys with special non-dot characters ────────────────────────────────────

	describe('keys containing special characters', () => {
		it('should resolve a key containing a hyphen', () => {
			expect(interpolateString('{first-name}' as string, { 'first-name': 'Max' })).toBe('Max');
		});

		it('should resolve a key containing a space (no trim conflict)', () => {
			// The space is inside the key itself, not padding — trimming removes outer spaces only
			// '{first name}' → rawKey = 'first name' → trim → 'first name'
			expect(interpolateString('{first name}' as string, { 'first name': 'Pat' })).toBe('Pat');
		});

		it('should resolve a key containing "+", which is a regex-special char in values not in keys', () => {
			expect(interpolateString('{a+b}' as string, { 'a+b': 'sum' })).toBe('sum');
		});
	});

	// ─── Interaction: fallback + strict ──────────────────────────────────────────

	describe('strict takes precedence over fallback', () => {
		it('should throw (not use fallback) when strict is true and a key is missing', () => {
			expect(() =>
				interpolateString('{x}' as string, {}, { strict: true, fallback: 'FB' }),
			).toThrow(RangeError);
		});
	});

	// ─── General edge cases ───────────────────────────────────────────────────────

	describe('general edge cases', () => {
		it('should handle a template with only a placeholder and nothing else', () => {
			expect(interpolateString('{msg}', { msg: 'hello' })).toBe('hello');
		});

		it('should handle a very long template efficiently', () => {
			const data: Record<string, unknown> = {};
			const parts: string[] = [];
			for (let i = 0; i < 100; i++) {
				data[`k${i}`] = `v${i}`;
				parts.push(`{k${i}}`);
			}
			const template = parts.join('-') as string;
			const expected = Object.values(data).join('-');
			expect(interpolateString(template, data)).toBe(expected);
		});

		it('should handle data with numeric string keys used by an array-like template', () => {
			// When data is a plain object (not an array), numeric-looking keys resolve normally
			expect(interpolateString('{0}' as string, { 0: 'zero' })).toBe('zero');
		});

		it('should not mutate the original template string', () => {
			const tpl = 'Hello, {name}!';
			interpolateString(tpl, { name: 'World' });
			expect(tpl).toBe('Hello, {name}!');
		});
	});
});
