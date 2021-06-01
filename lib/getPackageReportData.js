const semver = require('semver')
const getPackageJson = require('./getPackageJson.js')
const extractLink = require('./extractLink.js')
const extractLicense = require('./extractLicense.js')

module.exports = getPackageReportData

/*
	collect the data for a single package
*/
async function getPackageReportData(packageEntry) {
	let installedVersion = packageEntry.version
	if (installedVersion.match(/^[\^~].*/)) {
		installedVersion = installedVersion.substring(1);
	}

	const localVersion = semver.validRange(packageEntry.version)
	if (!localVersion) {
		const message = `skipping ${toPackageString(packageEntry)} (invalid semversion)`
		return { name: packageEntry.fullName, remoteVersion: message }
	}

	const fullPackageName = packageEntry.fullName
	const json = await getPackageJson(fullPackageName)

	// dont think it is possible but just to make sure.
	if (!json.versions) {
		throw new Error(`no versions in registry for package ${fullPackageName}`)
	}

	// find the right version for this package
	const versions = Object.keys(json.versions)
	const version = semver.maxSatisfying(versions, localVersion)
	if (!version) {
		throw new Error(`cannot find a version that satisfies range ${localVersion} in the registry`)
	}

	const versionData = json.versions[version]
	let author = ''
	if (isObject(json.author)) {
		author = json.author.name || ''
		if (json.author.email) {
			if (author.length > 0) {
				author += ' ';
			}
			author += json.author.email;
		}

		if (json.author.url) {
			if (author.length > 0){
				author += ' ';
			}
			author += json.author.url;
		}
	}

	return {
		name: fullPackageName,
		author: author,
		licenseType: extractLicense(versionData),
		link: extractLink(versionData),
		installedVersion: installedVersion,
		remoteVersion: version.toString(),
		comment: version.toString()
	}
}

function toPackageString(entry) {
	return entry.fullName + '@' + entry.version
}

function isObject(element) {
	return ((element !== null) && ((typeof element === "object") || (typeof element === 'function')))
}