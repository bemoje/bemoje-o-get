import oGet from '../src/o-get'

describe('oGet', () => {
	test('works', () => {
		const o1 = { id: 2, name: 'john' }
		expect(oGet(o1, 'id')).toBe(2)
		expect(oGet(o1, 'name')).toBe('john')
		const o2 = { fs: 0, a: { askf: 3, b: { c: 'wow', d: 'cool' } } }
		expect(oGet(o2, 'a.b.c')).toBe('wow')
	})
})
