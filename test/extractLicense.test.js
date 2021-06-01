const assert = require('assert')
const extractLicense = require('../lib/extractLicense.js')

describe('extractLicense', function () {
	
	it('if its a string', function () {
		const license = extractLicense({ license: '123' })
		assert.strictEqual(license, '123')
	})

	it('if its an array', function () {
		const license = extractLicense({ licenses: [{ type: '123' }, { type: '456' }] })
		assert.strictEqual(license, '123, 456')
	})
	
	it('cannot extract for some reason', function () {
		const license = extractLicense('lkasdlkjsdlkj')
		assert(!license)
	})
})