import path from 'node:path';

import got from 'got';
import semver from 'semver';
import createDebugMessages from 'debug';

import config from '../../lib/config.js';

const debug = createDebugMessages('license-report:expectedOutput');

/*
	Add all required data from the remote repository and add it to the entry
  in the expectedData;
	the field 'definedVersion' in the packagesData entries must contain the
	package name with the range character from the package.json to find the
	latest version satisfying the defined range (the range character will be
	removed later).
*/
async function addRemoteData(dependency) {
	let uri = path.join(config.registry, dependency.name)

	debug('addRemoteVersion - REQUEST %s', uri)

	const options = {
		retry: config.httpRetryOptions,
		timeout: config.httpTimeoutOptions,
		hooks: {
			beforeRetry: [
				(options, error, retryCount) => {
					debug(`http request to npm for package "${dependency.name}" failed, retrying again soon...`)
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
	let packagesJson = {}

	try {
		packagesJson = await got(uri, options).json()
	} catch (error) {
		packagesJson.error = `http request to npm for package "${dependency.name}" failed with error '${error}'`
	}

	// 'remoteVersion': find the right version for this package
	if(dependency.remoteVersion !== undefined) {
		dependency.remoteVersion = 'n/a'
		if(packagesJson.versions) {
			const versions = Object.keys(packagesJson.versions)
			const version = semver.maxSatisfying(versions, dependency.definedVersion)
			if (version) {
				dependency.remoteVersion = version.toString()
			}
		}
	}

	// latestRemoteVersion
	if(dependency.latestRemoteVersion !== undefined) {
		dependency.latestRemoteVersion = 'n/a'
		if ((packagesJson['dist-tags'] !== undefined) && (packagesJson['dist-tags'].latest !== undefined)) {
			dependency.latestRemoteVersion = packagesJson['dist-tags'].latest
		}
	}

	// latestRemoteModified
	if(dependency.latestRemoteModified !== undefined) {
		dependency.latestRemoteModified = 'n/a'
		if ((packagesJson.time !== undefined) && (packagesJson.time.modified !== undefined)) {
			dependency.latestRemoteModified = packagesJson.time.modified
		}
	}
}

/**
 * Add remoteVersion to objects in array of expectedData
 * @param {[object]} expectedData - array with expected data containing placeholders for remote versions
 */
async function addRemoteVersionsToExpectedData(expectedData) {
	await Promise.all(expectedData.map(async (packageData) => {
		await addRemoteData(packageData)
	}))
}

/*
	create expected value for json output
*/
function rawDataToJson(rawData) {
	return rawData
}

/*
	create expected value for csv output
*/
function rawDataToCsv(expectedData, csvTemplate) {
	const fieldNames = ['author', 'department', 'relatedTo', 'licensePeriod', 'material', 'licenseType', 'link', 'remoteVersion', 'installedVersion', 'definedVersion']
	const packageNamePattern = /\[\[(.+)]]/
	const templateLines = csvTemplate.split('\n')
	const resultLines = templateLines.map( line => {
		// find package name in line
		const found = line.match(packageNamePattern)
		if ((found !== null) && Array.isArray(found) && (found.length === 2)) {
			// get package data from expectedData
			const packageName = found[1]
			const expectedPackageData = expectedData.find(element => element.name === packageName)
			if (expectedPackageData !== undefined) {
				line = line.replace(found[0], expectedPackageData.name)
				fieldNames.forEach(fieldName => {
					line = line.replace(`{{${fieldName}}}`, expectedPackageData[fieldName])
				})
			}
		}

		return line
	})

	return resultLines.join('\n')
}

/*
	create expected value for table output
*/
function rawDataToTable(expectedData, tableTemplate) {
	const columnDefinitions = {
		author: {title: 'author', maxColumnWidth: 0},
		department: {title: 'department', maxColumnWidth: 0},
		relatedTo: {title: 'related to', maxColumnWidth: 0},
		name: {title: 'name', maxColumnWidth: 0},
		licensePeriod: {title: 'license period', maxColumnWidth: 0},
		material: {title: 'material / not material', maxColumnWidth: 0},
		licenseType: {title: 'license type', maxColumnWidth: 0},
		link: {title: 'link', maxColumnWidth: 0},
		remoteVersion: {title: 'remote version', maxColumnWidth: 0},
		installedVersion: {title: 'installed version', maxColumnWidth: 0},
		definedVersion: {title: 'defined version', maxColumnWidth: 0}
	}
	// get width of header columns
	for (const key in columnDefinitions) {
		if (Object.hasOwnProperty.call(columnDefinitions, key)) {
			columnDefinitions[key].maxColumnWidth = columnDefinitions[key].title.length
		}
	}
	// take account of the maximum width of data columns
	expectedData.forEach(element => {
		for (const [key, value] of Object.entries(element)) {
			columnDefinitions[key].maxColumnWidth = Math.max(columnDefinitions[key].maxColumnWidth, value.length)
		}
	})

	const templateLines = tableTemplate.split('\n')

	// adapt title lines
	let headerLines = {titleLine: templateLines[0], dashesLine: templateLines[1]}
	for (const [key, value] of Object.entries(columnDefinitions)) {
		headerLines.titleLine = headerLines.titleLine.replace(`{{${key}}}`, value.title.padEnd(value.maxColumnWidth))
		headerLines.dashesLine = headerLines.dashesLine.replace(`{{${key}}}`, '-'.repeat(value.title.length).padEnd(value.maxColumnWidth))
	}
	templateLines[0] = headerLines.titleLine.trimEnd()
	templateLines[1] = headerLines.dashesLine.trimEnd()

	// replace placeholders in all lines
	const packageNamePattern = /\[\[(.+)]]/
	for (let i = 2; i < templateLines.length; i++) {
		let line = templateLines[i]
		// find package name in line
		const found = line.match(packageNamePattern)
		if ((found !== null) && Array.isArray(found) && (found.length === 2)) {
			// get package data from expectedData
			const packageName = found[1]
			const expectedPackageData = expectedData.find(element => element.name === packageName)
			// replace placeholders with values
			if (expectedPackageData !== undefined) {
				line = line.replace(found[0], expectedPackageData.name.padEnd(columnDefinitions.name.maxColumnWidth))
				for (const [key, value] of Object.entries(columnDefinitions)) {
					line = line.replace(`{{${key}}}`, (expectedPackageData[key]).padEnd(value.maxColumnWidth))
				}
			}
		}

		templateLines[i] = line.trimEnd()
	}

	return templateLines.join('\n')
}

/*
	create expected value for html output
*/
function rawDataToHtml(expectedData, htmlTemplate) {
	const fieldNames = ['author', 'department', 'relatedTo', 'licensePeriod', 'material', 'licenseType', 'link', 'remoteVersion', 'installedVersion', 'definedVersion']
	const packageNamePattern = /\[\[(.+)]]/

	let startOfRow = htmlTemplate.indexOf('</thead><tbody>') + '</thead><tbody>'.length
	let updatedTemplate = htmlTemplate.slice(0, startOfRow)
	let endOfRow = htmlTemplate.indexOf('</td></tr>', startOfRow) + '</td></tr>'.length

	do {
		let row = htmlTemplate.substring(startOfRow, endOfRow)
		const found = row.match(packageNamePattern)
		if ((found !== null) && Array.isArray(found) && (found.length === 2)) {
			// get package data from expectedData
			const packageName = found[1]
			const expectedPackageData = expectedData.find(element => element.name === packageName)
			if (expectedPackageData !== undefined) {
				row = row.replace(found[0], expectedPackageData.name)
				fieldNames.forEach(fieldName => {
					row = row.replace(`{{${fieldName}}}`, expectedPackageData[fieldName])
				})
			}
		}
		updatedTemplate += row
		startOfRow = endOfRow
		endOfRow = htmlTemplate.indexOf('</td></tr>', startOfRow) + '</td></tr>'.length
	} while (endOfRow > startOfRow)

	updatedTemplate += htmlTemplate.slice(startOfRow)
	return updatedTemplate
}

/*
	create expected value for markdown output
*/
function rawDataToMarkdown(expectedData, csvTemplate) {
	const fieldNames = ['author', 'department', 'relatedTo', 'licensePeriod', 'material', 'licenseType', 'link', 'remoteVersion', 'installedVersion', 'definedVersion']
	const packageNamePattern = /\[\[(.+)]]/
	const templateLines = csvTemplate.split('\n')
	const resultLines = templateLines.map( line => {
		// find package name in line
		const found = line.match(packageNamePattern)
		if ((found !== null) && Array.isArray(found) && (found.length === 2)) {
			// get package data from expectedData
			const packageName = found[1]
			const expectedPackageData = expectedData.find(element => element.name === packageName)
			if (expectedPackageData !== undefined) {
				line = line.replace(found[0], expectedPackageData.name)
				fieldNames.forEach(fieldName => {
					line = line.replace(`{{${fieldName}}}`, expectedPackageData[fieldName])
				})
			}
		}

		return line
	})

	return resultLines.join('\n')
}

export default {
	addRemoteVersionsToExpectedData,
	rawDataToJson,
	rawDataToCsv,
	rawDataToTable,
	rawDataToHtml,
	rawDataToMarkdown
}
