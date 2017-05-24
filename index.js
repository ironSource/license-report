#!/usr/bin/env node

var path = require('path')
var debug = require('debug')('license-report')
var config = require('./lib/config.js')
var getPackageReportData = require('./lib/getPackageReportData.js')
var _ = require('lodash')
var table = require('text-table')
var readInstalled = require('read-installed')

if (!config.package) {
	config.package = './package.json'
}

if (path.extname(config.package) !== '.json')
	throw new Error('invalid package.json ' + config.package)

var resolvedPackageJson = path.resolve(process.cwd(), config.package)

debug('requiring %s', resolvedPackageJson)

var packageJson = require(resolvedPackageJson)

var deps = packageJson.dependencies
var devDeps = packageJson.devDependencies

/*
	an index of all the dependencies
*/
var depsIndex = {}

if(!config.only || config.only.indexOf('prod') > -1)
        _.merge(depsIndex, deps)

if(!config.only || config.only.indexOf('dev') > -1)
        _.merge(depsIndex, devDeps)
readInstalled(path.dirname(resolvedPackageJson), {depth: 1}, function(err, deps) {
	try {
            if (err) return console.error(err)
            var results =
              _(deps.dependencies).filter(
                  dep => {
                      return _.has(depsIndex, dep.name)
                  }
              ).map(getPackageReportData).value();
            if (results.length === 0) return console.log('nothing to do')

		for (var i = 0; i < results.length; i++) {
			var packageData = results[i]
			var finalData = {}

			for (var x = 0; x < config.fields.length; x++) {
				var fieldName = config.fields[x]

				// create only fields specified by the config
				finalData[fieldName] = packageData[fieldName]

				// fill in defaults
				if (!(fieldName in packageData))
					finalData[fieldName] = config[fieldName].value	
			}

			// turn every object to an array, make sure there are no undefined elements anywhere
			if (config.output === 'table' || config.output === 'csv') {
				finalData = _.toArray(finalData)

				for (var j = finalData.length - 1; j >= 0; j--) {
					if (!finalData[j])
						finalData[j] = 'n/a'
				}
			}

			results[i] = finalData
		}

		if (config.output === 'json') {
			console.log(JSON.stringify(results))
		} else if (config.output === 'table') {
			var labels = []
			var lines = []

			// create a labels array and a lines array
			// the lines will be the same length as the label's
			for (var i = 0; i < config.fields.length; i++) {
				var label = config[config.fields[i]].label
				labels.push(label)
				var line = new Buffer(Buffer.byteLength(label))
				line.fill('-')
				lines.push(line.toString())
			}
			
			results.unshift(lines)
			results.unshift(labels)

			console.log(table(results))
		} else if (config.output = 'csv') {
			for (var i = results.length - 1; i >= 0; i--) {
				results[i] = results[i].join(config.delimiter)
			}

			console.log(results.join('\n'))
		} else {
			throw new Error('invalid input')
		}

	} catch (e) {
		console.error(e.stack)
		process.exit(1)
	}	
})
