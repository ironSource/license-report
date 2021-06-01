const assert = require('assert')
const getPackageJson = require('../lib/getPackageJson.js')

describe('getPackageJson', () => {
  it('gets the information about the package "semver" from server', async () => {
    const packageJson = await getPackageJson('semver')
    assert.strictEqual(packageJson.homepage, 'https://github.com/npm/node-semver#readme')
  })

  it('throws on getting information about non existing package', async () => {
    await assert.rejects(
      getPackageJson('packagedoesnotexist'),
      (err) => {
        assert.strictEqual(err.name, 'HTTPError')
        assert.strictEqual(err.message, 'Response code 404 (Not Found)')
        return true
      }
    )
  })
})