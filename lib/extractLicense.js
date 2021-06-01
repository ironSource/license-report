module.exports = function(json) {

	if (typeof json.license === 'string') {
		return json.license
	}

	if (typeof json.license === 'object') {
		return json.license.type
	}

	if (Array.isArray(json.licenses)) {
		let result = ''
		for (let i = 0; i < json.licenses.length; i++) {
			if (i > 0)
				result += ', '

			if (typeof json.licenses[i] === 'string') {
				result += json.licenses[i]
			} else {
				result += json.licenses[i].type
			}
		}

		return result
	}
}