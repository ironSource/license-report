const request = require('request')
const config = require('./config.js')
const debug = require('debug')('license-report:getPackageJson')
const Stubborn = require('stubborn')

const get = module.exports = function(name, versionOrCallback, callback) {
	const uri = config.registry + name

	if (arguments.length === 2) {
		callback = versionOrCallback
	} else {
		uri += '/' + versionOrCallback
	}

	debug('REQUEST %s', uri)

	const stubborn = new Stubborn(exec, config.httpRetryOptions, function (err, result) {
		if (err) {
			return callback(err)
		}

		callback(null, result)
	})

	stubborn.on('attemptError', function (err) {
		console.error(err)
		console.error('http request to npm for package "' + name + '" failed, retrying again soon...')
	})

	stubborn.run()

	function exec(internalCallback) {
		const options = {
			url: uri
		}
		const npmToken = process.env[config.npmTokenEnvVar] || ''
		if (npmToken.trim().length > 0) {
			options['headers'] = { 'Authorization': `Bearer ${npmToken}` }
		}
		request(options, function(err, response, body) {
			if (err) {
				return internalCallback(err)
			}

			// 4xx / 5xx errors
			if (response.statusCode > 399 && response.statusCode < 599) {
				return internalCallback(new Error('invalid statusCode ' + response.statusCode))
			}

			let result, parseError

			try {
				debug('OK %s', uri)
				result = JSON.parse(body)
			} catch (e) {
				debug(e)
				debug(body)
				parseError = e
			}

			return internalCallback(parseError, result)
		})
	}
}
