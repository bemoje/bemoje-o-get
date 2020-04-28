import oGet from '../src/o-get'

const user = {
	id: 2,
	name: 'john',
	country: {
		id: 52,
		short: 'DK',
		long: 'Denmark',
	},
}

oGet(user, 'name')
//=> 'john'

oGet(user, 'country.id')
//=> 52

oGet(user, 'country.long')
//=> 'Denmark'
