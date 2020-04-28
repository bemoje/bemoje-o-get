import assertArgs from '@bemoje/assert-args'
import assertType from '@bemoje/assert-type'
import isString from '@bemoje/is-string'

/**
 * Get an object property, with dot-notation support for deeply nested properties.
 * @param {object} o - The object to search.
 * @param {string|Array<string>} key - object key with dot-notation support.
 * @returns {*} The nested property
 */
export default function oGet(o, key) {
	assertArgs(o, key)
	assertType([Array, String], key)

	let keys
	if (isString(key)) {
		keys = key.split('.')
	} else {
		keys = key
	}

	const len = keys.length

	if (len === 1) {
		return o[keys[0]]
	}

	let ret = o

	for (let i = 0; i < len; i++) {
		ret = ret[keys[i]]
	}

	return ret
}
