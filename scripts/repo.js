import { exec as exe } from 'child_process'
import fs from 'fs-extra'
import { extract as extractKeywords } from 'keyword-extractor'
import path from 'path'
import walkSync from 'walk-sync'

const log = console.log

function splitLines(str) {
	return str.match(/[^\r\n]+/gm)
}

function capFirstLetter(str) {
	return str.substring(0, 1).toUpperCase() + str.slice(1)
}

const repo = new (class {
	get packagePath() {
		return path.join(process.cwd(), 'package.json')
	}

	get examplesDirPath() {
		return path.join(process.cwd(), 'examples')
	}

	get package() {
		return JSON.parse(this.readFile(this.packagePath))
	}

	get githubPassword() {
		return require(path.join(process.cwd(), 'credentials', 'github.json'))
			.github
	}

	readFile(filePath) {
		return fs.readFileSync(filePath).toString()
	}

	filesIn(dirPath) {
		return fs.readdirSync(dirPath)
	}

	packageWrite(callback) {
		fs.writeFileSync(
			this.packagePath,
			JSON.stringify(callback(this.package), null, 3),
		)
	}

	bumpVersionMajor() {
		this.packageWrite((pkg) => {
			const arrVersion = pkg.version.split('.').map(Number)
			arrVersion[0]++
			arrVersion[1] = 0
			arrVersion[2] = 0
			pkg.version = arrVersion.join('.')
			return pkg
		})
	}

	bumpVersionMinor() {
		this.packageWrite((pkg) => {
			const arrVersion = pkg.version.split('.').map(Number)
			arrVersion[1]++
			arrVersion[2] = 0
			pkg.version = arrVersion.join('.')
			return pkg
		})
	}

	bumpVersionPatch() {
		this.packageWrite((pkg) => {
			const arrVersion = pkg.version.split('.').map(Number)
			arrVersion[2]++
			pkg.version = arrVersion.join('.')
			return pkg
		})
	}

	async exec(cmd) {
		return new Promise((resolve, reject) => {
			try {
				exe(cmd, (err, stdout, stderr) => {
					if (err) reject(err)
					const data = {
						cmd: cmd,
						stdout: splitLines(stdout),
						stderr: splitLines(stderr),
						print: () => {
							log(data.cmd)
							if (data.stdout) {
								for (let out of data.stdout) {
									log(out)
								}
							}
							if (data.stderr) {
								for (let err of data.stderr) {
									console.error(err)
								}
							}
						},
					}
					resolve(data)
				})
			} catch (err) {
				reject(err)
			}
		})
	}

	async npmPublish() {
		const o = await this.exec('npm publish --access public')
		o.print()
	}

	walkFiles(callback) {
		walkSync(process.cwd(), {
			directories: false,
			includeBasePath: true,
			ignore: ['node_modules', 'coverage', 'docs', '.git'],
		}).forEach((path) => {
			callback(path)
		})
	}

	replaceInAllFileNames(strFind, strReplace) {
		this.walkFiles((filePath) => {
			const arr = filePath.split('/')
			let fileName = arr.pop()
			if (fileName.includes(strFind)) {
				fileName = fileName.replace(strFind, strReplace)
				fs.renameSync(filePath, path.join(...arr, fileName))
			}
		})
	}

	replaceInAllFileContent(strFind, strReplace) {
		this.walkFiles((filePath) => {
			const src = this.readFile(filePath)
			const strNew = src.replace(new RegExp(strFind, 'g'), strReplace)
			fs.writeFileSync(filePath, strNew)
		})
	}

	getSrcEntryPath() {
		const arr = this.package.name.split('/')
		let filename
		if (arr.length === 1) {
			filename = arr[0]
		} else if (arr.length === 2) {
			filename = arr[1]
		}
		return path.join(process.cwd(), 'src', filename + '.js')
	}

	getSrcEntry() {
		return this.readFile(this.getSrcEntryPath())
	}

	parseName(fullName = this.package.name) {
		let name = fullName
		let isScoped = false
		let scope = ''
		let atScope = ''

		if (fullName.includes('@')) {
			isScoped = true
			const split = fullName.split('/')
			name = split[1]
			scope = split[0].replace('@', '')
			atScope = split[0]
		}

		let method = name
			.split('-')
			.map((part, i) => {
				if (i === 0) {
					return part
				} else {
					return capFirstLetter(part)
				}
			})
			.join('')
		let repoName = this.package.github.user + '-' + name

		return {
			method,
			fullName,
			name,
			isScoped,
			scope,
			atScope,
			repoName,
		}
	}

	async rename(name) {
		const oCurrent = this.parseName(this.package.name)
		const oNew = this.parseName(name)
		if (oCurrent.isScoped && !oNew.isScoped) {
			oNew.isScoped = oCurrent.isScoped
			oNew.atScope = oCurrent.atScope
			oNew.scope = oCurrent.scope
		}

		log({ oCurrent, oNew })

		this.replaceInAllFileNames(oCurrent.atScope, oNew.atScope)
		this.replaceInAllFileContent(oCurrent.atScope, oNew.atScope)

		this.replaceInAllFileNames(oCurrent.name, oNew.name)
		this.replaceInAllFileContent(oCurrent.name, oNew.name)

		this.replaceInAllFileNames(oCurrent.method, oNew.method)
		this.replaceInAllFileContent(oCurrent.method, oNew.method)
	}

	listApi() {
		const proto = this.constructor.prototype
		let protoKeys = Object.getOwnPropertyNames(proto)
		protoKeys = protoKeys.map((key, i) => {
			const descriptor = Object.getOwnPropertyDescriptor(proto, key)
			if (typeof descriptor.value !== 'undefined') {
				return key + '()'
			} else {
				return key
			}
		})
		log(protoKeys.sort().join('\n'))
	}

	writeReadme() {
		const {
			method,
			fullName,
			name,
			isScoped,
			scope,
			atScope,
			repoName,
		} = this.parseName()

		const githubUser = this.package.github.user
		const npmUser = githubUser

		const str = [
			'# ' + fullName,
			'',
			this.package.description,
			'',
			'#### Version',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://img.shields.io/npm/v/' +
				(isScoped ? atScope + '/' : '') +
				'' +
				name +
				'" alt="NPM version" /></a></span>',
			'',
			'#### Travis CI',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://travis-ci.org/' +
				githubUser +
				'/' +
				repoName +
				'.svg?branch=master" alt="dependencies" /></a></span>',
			'',
			'#### Dependencies',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://david-dm.org/' +
				githubUser +
				'/' +
				repoName +
				'.svg" alt="dependencies" /></a></span>',
			'',
			'#### Stats',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://img.shields.io/npm/dt/' +
				atScope +
				'/' +
				name +
				'" alt="NPM downloads" /></a></span>',
			'<span><a href="https://github.com/' +
				githubUser +
				'/' +
				repoName +
				'/fork" title="Fork this project"><img src="https://img.shields.io/github/forks/' +
				githubUser +
				'/' +
				repoName +
				'" alt="Forks" /></a></span>',
			'',
			'#### Donate',
			'',
			'<span><a href="https://www.buymeacoffee.com/bemoje" title="Donate to this project using Buy Me A Beer"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?label=Buy me a beer!" alt="Buy Me A Beer donate button" /></a></span>',
			'<span><a href="https://paypal.me/forstaaloen" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg?label=PayPal" alt="PayPal donate button" /></a></span>',
			'',
			'## Installation',
			'',
			'```sh',
			'npm install ' + fullName,
			'npm install --save ' + fullName,
			'npm install --save-dev ' + fullName,
			'```',
			'',
			'## Usage',
			'',
			'```javascript',
			'',
			this.filesIn(this.examplesDirPath)
				.map((filePath) => {
					const lines = this.readFile(
						path.join(this.examplesDirPath, filePath),
					).split(/\r\n|\r|\n/gm)
					lines[0] = lines[0].replace(
						/ from '(.+)'/,
						" from '" + fullName + "'",
					)
					return lines
						.map((line) => {
							return line.replace(/\t/g, '  ')
						})
						.join('\n')
				})
				.join('\n\n'),
			'```',
			'',
			(() => {
				const benchResultsPath = path.join(
					process.cwd(),
					'benchmark',
					'results.md',
				)
				if (fs.existsSync(benchResultsPath)) {
					return this.readFile(benchResultsPath)
				}
				return ''
			})(),
			'## Tests',
			'Uses *Jest* to test module functionality. Run tests to get coverage details.',
			'',
			'```bash',
			'npm run test',
			'```',
			'',
			'## API',
			this.getApi(),
		].join('\n')
		const filePath = path.join(process.cwd(), 'readme.md')
		fs.writeFileSync(filePath, str, 'utf8')
	}

	getApi() {
		const apiPath = path.join(process.cwd(), 'docs', 'api.md')
		if (fs.existsSync(apiPath)) {
			let lines = splitLines(this.readFile(apiPath))
			lines = lines
				.map((line) => {
					if (line.includes('###')) {
						return line.replace('###', '####')
					}
					return line
				})
				.map((line) => {
					if (line.includes('#### Parameters')) {
						return '##### Parameters'
					}
					return line
				})
			return lines.join('\n\n')
		}
		return ''
	}

	async gitCommit() {
		const data = await this.exec('bash scripts/github-commit.sh')
		data.print()
	}

	async gitCreate() {
		const user = this.package.github.user
		const pw = this.githubPassword
		const repoName = user + '-' + this.parseName().name
		const description = this.package.description
		const script =
			'bash ' + path.join(process.cwd(), 'scripts', 'github-create.sh')
		let data = await this.exec(
			`${script} ${user} ${pw} ${repoName} "${description}"`,
		)
		data.print()
		data = await this.gitCommit()
	}

	keywords() {
		this.packageWrite((pack) => {
			pack.keywords = this.getKeywords()
			return pack
		})
	}

	getBlockComments() {
		const dirPath = path.join(process.cwd(), 'src')
		return this.filesIn(dirPath)
			.map((fileName) => {
				return path.join(dirPath, fileName)
			})
			.map((filePath) => {
				return this.readFile(filePath)
			})
			.map((str) => {
				let inBlock = false
				return splitLines(str)
					.reduce((accum, line, i) => {
						if (line.includes('/**')) {
							inBlock = true
						} else if (line.includes('*/')) {
							inBlock = false
						} else if (inBlock) {
							accum.push(line.replace('*', '').trim())
						}
						return accum
					}, [])
					.join(' ')
			})
	}

	getKeywords() {
		const str =
			this.getBlockComments()
				.map((comment) => {
					return comment
						.split(' ')
						.filter((word) => {
							return !word.includes('@') && !word.includes('{')
						})
						.join(' ')
				})
				.join('\n') +
			' ' +
			this.parseName().method.split('-').join(' ')

		return extractKeywords(str, {
			language: 'english',
			remove_digits: true,
			return_changed_case: true,
			remove_duplicates: true,
		})
	}

	getJsDocDescription() {
		const lines = splitLines(this.getSrcEntry())
		let index
		for (let i = 0, len = lines.length; i < len; i++) {
			const line = lines[i]
			if (line.indexOf('/**') === 0) {
				index = i + 1
				break
			}
		}
		if (lines[index].includes('@')) {
			if (!lines[index].includes('@desc')) {
				return ''
			}
		}
		return lines[index].replace('*', '').trim()
	}

	description(str) {
		if (!str) {
			str = this.getJsDocDescription()
		}
		if (str.length !== 0) {
			this.packageWrite((pack) => {
				pack.description = str
				return pack
			})
		}
	}

	version(strVersion) {
		if (/^\d*\.\d*\.\d*$/.test(strVersion)) {
			this.packageWrite((pack) => {
				pack.version = strVersion
				return pack
			})
		}
	}
})()

// cli
const main = async () => {
	try {
		const args = process.argv
		args.shift()
		args.shift()
		const methodName = args.shift()
		return await repo[methodName](...args)
	} catch (err) {
		log(err)
	}
}

// run main
main()
	.then((retValue) => {
		if (retValue !== undefined) {
			process.stdout._write(retValue)
		}
		process.exit(0)
	})
	.catch((err) => {
		log(err)
	})
