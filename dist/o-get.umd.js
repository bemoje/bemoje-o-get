(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@bemoje/assert-args'), require('@bemoje/assert-type'), require('@bemoje/is-string')) :
	typeof define === 'function' && define.amd ? define(['@bemoje/assert-args', '@bemoje/assert-type', '@bemoje/is-string'], factory) :
	(global = global || self, global['o-get'] = factory(global.assertArgs, global.assertType, global.isString));
}(this, (function (assertArgs, assertType, isString) { 'use strict';

	assertArgs = assertArgs && Object.prototype.hasOwnProperty.call(assertArgs, 'default') ? assertArgs['default'] : assertArgs;
	assertType = assertType && Object.prototype.hasOwnProperty.call(assertType, 'default') ? assertType['default'] : assertType;
	isString = isString && Object.prototype.hasOwnProperty.call(isString, 'default') ? isString['default'] : isString;

	/**
	 * Get an object property, with dot-notation support for deeply nested properties.
	 * @param {object} o - The object to search.
	 * @param {string|Array<string>} key - object key with dot-notation support.
	 * @returns {*} The nested property
	 */
	function oGet(o, key) {
		assertArgs(o, key);
		assertType([Array, String], key);

		let keys;
		if (isString(key)) {
			keys = key.split('.');
		} else {
			keys = key;
		}

		const len = keys.length;

		if (len === 1) {
			return o[keys[0]]
		}

		let ret = o;

		for (let i = 0; i < len; i++) {
			ret = ret[keys[i]];
		}

		return ret
	}

	return oGet;

})));
