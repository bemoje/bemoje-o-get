# @bemoje/o-get

Get an object property, with dot-notation support for deeply nested properties.

#### Version

<span><a href="https://npmjs.org/@bemoje/o-get" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@bemoje/o-get" alt="NPM version" /></a></span>

#### Travis CI

<span><a href="https://npmjs.org/@bemoje/o-get" title="View this project on NPM"><img src="https://travis-ci.org/bemoje/bemoje-o-get.svg?branch=master" alt="dependencies" /></a></span>

#### Dependencies

<span><a href="https://npmjs.org/@bemoje/o-get" title="View this project on NPM"><img src="https://david-dm.org/bemoje/bemoje-o-get.svg" alt="dependencies" /></a></span>

#### Stats

<span><a href="https://npmjs.org/@bemoje/o-get" title="View this project on NPM"><img src="https://img.shields.io/npm/dt/@bemoje/o-get" alt="NPM downloads" /></a></span>
<span><a href="https://github.com/bemoje/bemoje-o-get/fork" title="Fork this project"><img src="https://img.shields.io/github/forks/bemoje/bemoje-o-get" alt="Forks" /></a></span>

#### Donate

<span><a href="https://www.buymeacoffee.com/bemoje" title="Donate to this project using Buy Me A Beer"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?label=Buy me a beer!" alt="Buy Me A Beer donate button" /></a></span>
<span><a href="https://paypal.me/forstaaloen" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg?label=PayPal" alt="PayPal donate button" /></a></span>

## Installation

```sh
npm install @bemoje/o-get
npm install --save @bemoje/o-get
npm install --save-dev @bemoje/o-get
```

## Usage

```javascript
import oGet from '@bemoje/o-get'

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

```


## Tests
Uses *Jest* to test module functionality. Run tests to get coverage details.

```bash
npm run test
```

## API
### oGet

Get an object property, with dot-notation support for deeply nested properties.

##### Parameters

-   `o` **[object][3]** The object to search.

-   `key` **([string][4] \| [Array][5]&lt;[string][4]>)** object key with dot-notation support.

##### Returns
**any** The nested property

[1]: #oget

[2]: #parameters

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[4]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[5]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array