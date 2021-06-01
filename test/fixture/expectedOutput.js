const got = require('got')
const semver = require('semver')
const packageJson = require('../../package.json')
const config = require('../../lib/config.js')

/*
	get latest version from registry and add it to the entry in the expectedData;
	the field 'installedVersion' in the packagesData entries must contain the
	package name with the range character from the package.json to find the
	latest version satisfying the defined range (the range character will be
	removed later)
*/
async function addRemoteVersion(dependency) {
	dependency.remoteVersion = 'n/a'
	let uri = config.registry + dependency.name
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
	const packagesJson = await got(uri, options).json()

	// find the right version for this package
	const versions = Object.keys(packagesJson.versions)
	const version = semver.maxSatisfying(versions, dependency.installedVersion)
	if (version) {
		dependency.remoteVersion = version.toString()
	}
}

/*
	add current values for installedVersion and remoteVersion to list of expectedData
*/
module.exports.addVersionToExpectedData = async (expectedData)  => {
	// add version from package.json (dev-) dependencies as installedVersion
	const packagesList = Object.assign(Object.assign({}, packageJson.dependencies), packageJson.devDependencies)
	const packagesData = expectedData.map(packageData => {
		packageData.installedVersion = packagesList[packageData.name]
		return packageData
	})

	await Promise.all(packagesData.map(async (packageData) => {
		await addRemoteVersion(packageData)
	}))

	// remove range character from installedVersion
	packagesData.forEach(packageData => {
		if (packageData.installedVersion.match(/^[\^~].*/)) {
			packageData.installedVersion = packageData.installedVersion.substring(1)
		}
	})
}

/*
	create expected value for json output
*/
module.exports.rawDataToJson = (rawData) => {
	return rawData
}

/*
	create expected value for csv output
*/
module.exports.rawDataToCsv = (expectedData, csvTemplate) => {
	const fieldNames = ['author', 'department', 'relatedTo', 'licensePeriod', 'material', 'licenseType', 'link', 'remoteVersion', 'installedVersion']
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
module.exports.rawDataToTable = (expectedData, tableTemplate) => {
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
		installedVersion: {title: 'installed version', maxColumnWidth: 0}
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
module.exports.rawDataToHtml = (expectedData, htmlTemplate) => {
	const fieldNames = ['author', 'department', 'relatedTo', 'licensePeriod', 'material', 'licenseType', 'link', 'remoteVersion', 'installedVersion']
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