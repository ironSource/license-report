const assert = require('assert')
const extractLink = require('../lib/extractLink.js')

describe('extractLink', function () {
	it('extracts the repository link if its there', function () {
		const link = extractLink({ repository: { url: 'http://lala.com' }})
		assert.strictEqual(link, 'http://lala.com')
	})

	it('search for another http link if repo link isnt there', function () {
		const link = extractLink({ url: 'http://lala.com' })
		assert.strictEqual(link, 'http://lala.com')
	})

	it('search for another http link if repo link isnt there', function () {
		const link = extractLink({ repo: 'git://lala.com' })
		assert.strictEqual(link, 'git://lala.com')
	})

	it('returns nothing otherwise', function () {
		const link = extractLink({ url: 'lala.com' })
		assert(!link)
	})
})