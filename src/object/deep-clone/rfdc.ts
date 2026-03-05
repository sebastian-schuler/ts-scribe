/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable n/prefer-global/buffer */
/* eslint-disable @typescript-eslint/ban-ts-comment */

type RfdcOptions = {
	circles?: boolean;
	proto?: boolean;
};

type CloneFunction = <T>(object: T) => T;

function copyBuffer(cur: ArrayBufferView): ArrayBufferView {
	// @ts-ignore - Buffer is a Node.js global
	if (cur instanceof Buffer) {
		// @ts-ignore - Buffer is a Node.js global
		return Buffer.from(cur);
	}

	// @ts-ignore - TypedArray constructor signature
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	return new cur.constructor([...cur.buffer], cur.byteOffset, cur.length);
}

export function rfdc(options?: RfdcOptions): CloneFunction {
	const options_ = options ?? {};

	if (options_.circles) return rfdcCircles(options_);
	return options_.proto ? cloneProto : clone;

	function cloneArray(a: any[], fn: CloneFunction): any[] {
		const keys = Object.keys(a);
		const a2 = Array.from({ length: keys.length });
		for (const k of keys) {
			// @ts-ignore - string indexing intentional for array cloning
			const cur = a[k];
			if (typeof cur !== 'object' || cur === null) {
				// @ts-ignore - string indexing intentional
				a2[k] = cur;
			} else if (cur instanceof Date) {
				// @ts-ignore - string indexing intentional
				a2[k] = new Date(cur);
			} else if (cur instanceof RegExp) {
				// @ts-ignore - string indexing intentional
				a2[k] = new RegExp(cur.source, cur.flags);
			} else if (ArrayBuffer.isView(cur)) {
				// @ts-ignore - string indexing intentional
				a2[k] = copyBuffer(cur);
			} else {
				// @ts-ignore - string indexing intentional
				a2[k] = fn(cur);
			}
		}

		return a2;
	}

	function clone<T>(o: T): T {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o) as T;
		if (o instanceof RegExp) return new RegExp(o.source, o.flags) as T;
		if (Array.isArray(o)) return cloneArray(o, clone) as T;
		if (o instanceof Map) return new Map(cloneArray([...o], clone)) as T;
		if (o instanceof Set) return new Set(cloneArray([...o], clone)) as T;

		const o2: Record<string, any> = {};
		for (const k in o) {
			if (!Object.hasOwn(o, k)) continue;
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
			} else if (cur instanceof RegExp) {
				o2[k] = new RegExp(cur.source, cur.flags);
			} else if (cur instanceof Map) {
				o2[k] = new Map(cloneArray([...cur], clone));
			} else if (cur instanceof Set) {
				o2[k] = new Set(cloneArray([...cur], clone));
			} else if (ArrayBuffer.isView(cur)) {
				o2[k] = copyBuffer(cur);
			} else {
				o2[k] = clone(cur);
			}
		}

		return o2 as T;
	}

	function cloneProto<T>(o: T): T {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o) as T;
		if (o instanceof RegExp) return new RegExp(o.source, o.flags) as T;
		if (Array.isArray(o)) return cloneArray(o, cloneProto) as T;
		if (o instanceof Map) return new Map(cloneArray([...o], cloneProto)) as T;
		if (o instanceof Set) return new Set(cloneArray([...o], cloneProto)) as T;

		const o2: Record<string, any> = {};
		for (const k in o) {
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
			} else if (cur instanceof RegExp) {
				o2[k] = new RegExp(cur.source, cur.flags);
			} else if (cur instanceof Map) {
				o2[k] = new Map(cloneArray([...cur], cloneProto));
			} else if (cur instanceof Set) {
				o2[k] = new Set(cloneArray([...cur], cloneProto));
			} else if (ArrayBuffer.isView(cur)) {
				o2[k] = copyBuffer(cur);
			} else {
				o2[k] = cloneProto(cur);
			}
		}

		return o2 as T;
	}
}

function rfdcCircles(options: RfdcOptions): CloneFunction {
	const refs: any[] = [];
	const refsNew: any[] = [];

	return options.proto ? cloneProto : clone;

	function cloneArray(a: any[], fn: CloneFunction): any[] {
		const keys = Object.keys(a);
		const a2 = Array.from({ length: keys.length });
		for (const k of keys) {
			// @ts-ignore - string indexing intentional for array cloning
			const cur = a[k];
			if (typeof cur !== 'object' || cur === null) {
				// @ts-ignore - string indexing intentional
				a2[k] = cur;
			} else if (cur instanceof Date) {
				// @ts-ignore - string indexing intentional
				a2[k] = new Date(cur);
			} else if (cur instanceof RegExp) {
				// @ts-ignore - string indexing intentional
				a2[k] = new RegExp(cur.source, cur.flags);
			} else if (ArrayBuffer.isView(cur)) {
				// @ts-ignore - string indexing intentional
				a2[k] = copyBuffer(cur);
			} else {
				const index = refs.indexOf(cur);
				// @ts-ignore - string indexing intentional
				a2[k] = index === -1 ? fn(cur) : refsNew[index];
			}
		}

		return a2;
	}

	function clone<T>(o: T): T {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o) as T;
		if (o instanceof RegExp) return new RegExp(o.source, o.flags) as T;
		if (Array.isArray(o)) return cloneArray(o, clone) as T;
		if (o instanceof Map) return new Map(cloneArray([...o], clone)) as T;
		if (o instanceof Set) return new Set(cloneArray([...o], clone)) as T;

		const o2: Record<string, any> = {};
		refs.push(o);
		refsNew.push(o2);

		for (const k in o) {
			if (!Object.hasOwn(o, k)) continue;
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
			} else if (cur instanceof RegExp) {
				o2[k] = new RegExp(cur.source, cur.flags);
			} else if (cur instanceof Map) {
				o2[k] = new Map(cloneArray([...cur], clone));
			} else if (cur instanceof Set) {
				o2[k] = new Set(cloneArray([...cur], clone));
			} else if (ArrayBuffer.isView(cur)) {
				o2[k] = copyBuffer(cur);
			} else {
				const i = refs.indexOf(cur);
				o2[k] = i === -1 ? clone(cur) : refsNew[i];
			}
		}

		refs.pop();
		refsNew.pop();
		return o2 as T;
	}

	function cloneProto<T>(o: T): T {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o) as T;
		if (o instanceof RegExp) return new RegExp(o.source, o.flags) as T;
		if (Array.isArray(o)) return cloneArray(o, cloneProto) as T;
		if (o instanceof Map) return new Map(cloneArray([...o], cloneProto)) as T;
		if (o instanceof Set) return new Set(cloneArray([...o], cloneProto)) as T;

		const o2: Record<string, any> = {};
		refs.push(o);
		refsNew.push(o2);

		for (const k in o) {
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
			} else if (cur instanceof RegExp) {
				o2[k] = new RegExp(cur.source, cur.flags);
			} else if (cur instanceof Map) {
				o2[k] = new Map(cloneArray([...cur], cloneProto));
			} else if (cur instanceof Set) {
				o2[k] = new Set(cloneArray([...cur], cloneProto));
			} else if (ArrayBuffer.isView(cur)) {
				o2[k] = copyBuffer(cur);
			} else {
				const i = refs.indexOf(cur);
				o2[k] = i === -1 ? cloneProto(cur) : refsNew[i];
			}
		}

		refs.pop();
		refsNew.pop();
		return o2 as T;
	}
}
