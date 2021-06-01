const assert = require('assert')
const getPackageReportData = require('../lib/getPackageReportData.js')

describe('getPackageReportData', function() {
	this.timeout(20000)

	it('gets the package report data', async () => {
		const packageReportData = await getPackageReportData({ name: 'async', fullName: 'async', version: '>0.0.1' })

		assert.strictEqual(packageReportData.name, 'async')
		assert.strictEqual(packageReportData.licenseType, 'MIT')
		assert.strictEqual(packageReportData.link, 'git+https://github.com/caolan/async.git')
	})

	it('returns an error entry when semver is invalid', async () => {
		const packageReportData = await getPackageReportData({ name: 'async', fullName: 'async', version: 'a.b.c' })

		assert.strictEqual(packageReportData.name, 'async')
		assert.strictEqual(packageReportData.remoteVersion, 'skipping async@a.b.c (invalid semversion)')
	})

	it('returns an error when no versions satisfy the condition', async () => {
		await assert.rejects(
      getPackageReportData({ name: 'async', fullName: 'async', version: '0.0.1' }),
      (err) => {
				assert(err.message.indexOf('cannot find a version that satisfies range') === 0)
        return true
      }
		)
	})

	it('return only author name', async () => {
		const packageReportData = await getPackageReportData({ name: 'google-auth-library', fullName: 'google-auth-library', version: '7.0.2' })

		assert.strictEqual(packageReportData.author, 'Google Inc.')
	})
	it('return only author email', async () => {
		const packageReportData = await getPackageReportData({ name: 'react-hook-form', fullName: 'react-hook-form', version: '6.15.1' })

		assert.strictEqual(packageReportData.author, 'bluebill1049@hotmail.com')
	})

	it('return author name with url', async () => {
		const packageReportData = await getPackageReportData({ name: 'knex', fullName: 'knex', version: '0.21.17' })

		assert.strictEqual(packageReportData.author, 'Tim Griesser https://github.com/tgriesser')
	})

	it('return author name with email',async () => {
		const packageReportData = await getPackageReportData({ name: 'typeorm', fullName: 'typeorm', version: '0.2.31' })

		assert.strictEqual(packageReportData.author, 'Umed Khudoiberdiev pleerock.me@gmail.com')
	})
})