const got = require('got')
const config = require('./config.js')
const debug = require('debug')('license-report:getPackageJson')

module.exports = async function(name) {
	const uri = config.registry + name

	debug('REQUEST %s', uri)

	const options = {
		retry: config.httpRetryOptions.maxAttempts,
		hooks: {
			beforeRetry: [
				(options, error, retryCount) => {
					debug(`http request to npm for package "${name}" failed, retrying again soon...`)
				}
			],
			beforeError: [
				error => {
					debug(error)
					return error
				}
			]
		}
	}
	return await got(uri, options).json()
}