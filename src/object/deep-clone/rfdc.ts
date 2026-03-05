/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

function copyBuffer(cur) {
	if (cur instanceof Buffer) {
		return Buffer.from(cur);
	}

	return new cur.constructor([...cur.buffer], cur.byteOffset, cur.length);
}

export function rfdc(options) {
	options ||= {};

	if (options.circles) return rfdcCircles(options);
	return options.proto ? cloneProto : clone;

	function cloneArray(a, fn) {
		const keys = Object.keys(a);
		const a2 = Array.from({ length: keys.length });
		for (const k of keys) {
			const cur = a[k];
			if (typeof cur !== 'object' || cur === null) {
				a2[k] = cur;
			} else if (cur instanceof Date) {
				a2[k] = new Date(cur);
			} else if (ArrayBuffer.isView(cur)) {
				a2[k] = copyBuffer(cur);
			} else {
				a2[k] = fn(cur);
			}
		}

		return a2;
	}

	function clone(o) {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o);
		if (Array.isArray(o)) return cloneArray(o, clone);
		if (o instanceof Map) return new Map(cloneArray([...o], clone));
		if (o instanceof Set) return new Set(cloneArray([...o], clone));
		const o2 = {};
		for (const k in o) {
			if (!Object.hasOwn(o, k)) continue;
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
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

		return o2;
	}

	function cloneProto(o) {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o);
		if (Array.isArray(o)) return cloneArray(o, cloneProto);
		if (o instanceof Map) return new Map(cloneArray([...o], cloneProto));
		if (o instanceof Set) return new Set(cloneArray([...o], cloneProto));
		const o2 = {};
		for (const k in o) {
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
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

		return o2;
	}
}

function rfdcCircles(options) {
	const refs = [];
	const refsNew = [];

	return options.proto ? cloneProto : clone;

	function cloneArray(a, fn) {
		const keys = Object.keys(a);
		const a2 = Array.from({ length: keys.length });
		for (const k of keys) {
			const cur = a[k];
			if (typeof cur !== 'object' || cur === null) {
				a2[k] = cur;
			} else if (cur instanceof Date) {
				a2[k] = new Date(cur);
			} else if (ArrayBuffer.isView(cur)) {
				a2[k] = copyBuffer(cur);
			} else {
				const index = refs.indexOf(cur);
				a2[k] = index === -1 ? fn(cur) : refsNew[index];
			}
		}

		return a2;
	}

	function clone(o) {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o);
		if (Array.isArray(o)) return cloneArray(o, clone);
		if (o instanceof Map) return new Map(cloneArray([...o], clone));
		if (o instanceof Set) return new Set(cloneArray([...o], clone));
		const o2 = {};
		refs.push(o);
		refsNew.push(o2);
		for (const k in o) {
			if (!Object.hasOwn(o, k)) continue;
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
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
		return o2;
	}

	function cloneProto(o) {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o);
		if (Array.isArray(o)) return cloneArray(o, cloneProto);
		if (o instanceof Map) return new Map(cloneArray([...o], cloneProto));
		if (o instanceof Set) return new Set(cloneArray([...o], cloneProto));
		const o2 = {};
		refs.push(o);
		refsNew.push(o2);
		for (const k in o) {
			const cur = o[k];
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
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
		return o2;
	}
}
