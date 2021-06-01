/*
	add all packages to a package index array. 
	maintaining uniqueness (crudely)
*/
module.exports = function(packages, packageIndex, exclusions) {
	exclusions = exclusions || []

	// iterate over packages and prepare urls before I call the registry
	for (let key in packages) {
		if (exclusions.indexOf(key) !== -1) {
			continue
		}

		let name = key
		const fullName = key
		const version = packages[key]
		let scope = undefined

		if (key.indexOf('@') === 0) {
			const scopeSeparator = key.indexOf('/')
			scope = key.substring(1, scopeSeparator)
			name = key.substring(scopeSeparator + 1, key.length)
		}

		const newEntry = {
			fullName: fullName,
			name: name,
			version: version,
			scope: scope
		}

		const indexOfNewEntry = packageIndex.findIndex(entry => (entry.name === newEntry.name && entry.version === newEntry.version && entry.scope === newEntry.scope))

		if (indexOfNewEntry === -1) {
			packageIndex.push(newEntry)
		}
	}
}