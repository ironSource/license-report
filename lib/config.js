var rc = require('rc')
var path = require('path')

var config = module.exports = rc('license-report', {

	/*
		possible outputs:

		json || table || csv || html
	*/
	output: 'json',

	/*
		if output is html
	*/
	html: {
		cssFile: path.resolve(__dirname, '..', 'defaultHtmlStyle.css'),

		// passed directly to tableify (see: https://github.com/kessler/node-tableify)
		tableify: {}
	},

	/*
		if output is csv
	*/
	delimiter: ',',

	/*
		escape fields containing delimiter character if output is csv
	*/
	escapeCsvFilelds: false,

	/*
		export deps or dev deps. falsey -> output everything
	*/
	only: null,

	/*
		npm registry url
	*/
	registry: 'https://registry.npmjs.org/',

	/*
		name of the environment variable holding the access token for private npm registries
	*/
	npmTokenEnvVar: 'NPM_TOKEN',

	/*
		an array of package names that will be excluded from the  report
	*/
	exclude: [],

	/*
		fields participating in the report and their order
	*/
	fields: [
		'department',
		'relatedTo',
		'name',
		'licensePeriod',
		'material',
		'licenseType',
		'link',
		'remoteVersion',
		'installedVersion',
		'author'
	],

	department: {
		value: 'kessler',
		label: 'department'
	},
	relatedTo: {
		value: 'stuff',
		label: 'related to'
	},
	licensePeriod: {
		value: 'perpetual',
		label: 'license period'
	},
	material: {
		value: 'material',
		label: 'material / not material'
	},
	name: {
		value: '',
		label: 'name'
	},
	licenseType: {
		value: 'n/a',
		label: 'license type'
	},
	link: {
		value: 'n/a',
		label: 'link'
	},
	remoteVersion: {
		value: '',
		label: 'remote version'
	},
	installedVersion: {
		value: 'n/a',
		label: 'installed version'
	},
	author: {
		value: 'n/a',
		label: 'author'
	},
	comment: {
		value: '',
		label: 'comment'
	},
	httpRetryOptions: {
		maxAttempts: 5,
		delay: 1000
	}
})