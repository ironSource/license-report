const assert = require('assert')
const addPackagesToIndex = require('../lib/addPackagesToIndex.js')

describe('addPackagesToIndex', function() {
	let index, packages

	beforeEach(function() {
		index = []
		packages = {
			"@kessler/exponential-backoff": "^2.0.0",
			"async": "^0.9.0",
			"debug": "^3.1.0",
			"lodash": "^4.17.11",
			"rc": "^1.2.8",
			"request": "^2.88.0",
			"semver": "^5.4.1",
			"stubborn": "^1.2.5",
			"text-table": "^0.2.0",
			"visit-values": "^1.0.1"
		}
	})

	it('adds a package to the index', function() {
		addPackagesToIndex({ "foo": "*" }, index)
		assert.deepStrictEqual(index, [{ fullName: 'foo', name: 'foo', version: '*', scope: undefined }])
	})

	it('adds a scoped package to the index', function() {
		addPackagesToIndex({ "@bar/foo": "*" }, index)
		assert.deepStrictEqual(index, [{ fullName: '@bar/foo', name: 'foo', version: '*', scope: 'bar' }])
	})

	it('does not add duplicate packages, same package is a package that has the same name, version expression and scope', function() {
		addPackagesToIndex({ "@bar/foo": "*" }, index)
		addPackagesToIndex({ "@bar/foo": "*" }, index)
		addPackagesToIndex({ "@bar/foo": "1.2.3" }, index)
		addPackagesToIndex({ "foo": "1.1.1" }, index)
		addPackagesToIndex({ "foo": "1.1.1" }, index)
		addPackagesToIndex({ "foo": "1.2.3" }, index)

		assert.deepStrictEqual(index, [
			{ fullName: '@bar/foo', name: 'foo', version: '*', scope: 'bar' },
			{ fullName: '@bar/foo', name: 'foo', version: '1.2.3', scope: 'bar' },
			{ fullName: 'foo', name: 'foo', version: '1.1.1', scope: undefined },
			{ fullName: 'foo', name: 'foo', version: '1.2.3', scope: undefined }
		])
	})

	it('excludes package names that are specified in the exclusion parameter, currently this is a broad exclusion, i.e all packages with specified names are excluded', function() {
		const exclude = ['@bar/foo']
		addPackagesToIndex({ "@bar/foo": "1.2.3" }, index, exclude)
		addPackagesToIndex({
			"@bar/foo": "*",
			"foo": "1.1.1"
		}, index, exclude)

		assert.deepStrictEqual(index, [{ fullName: 'foo', name: 'foo', version: '1.1.1', scope: undefined }])
	})
})