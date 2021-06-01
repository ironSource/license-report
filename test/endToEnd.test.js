const cp = require('child_process')
const util = require('util');
const path = require('path')
const assert = require('assert')
const fs = require('fs')
const eol = require('eol')
const expectedOutput = require('./fixture/expectedOutput.js')

const scriptPath = path
	.resolve(__dirname, '..', 'index.js')
	.replace(/(\s+)/g, '\\$1')

const execAsPromise = util.promisify(cp.exec);

let expectedData

describe('end to end test', function() {
	this.timeout(50000)

	beforeEach(async  () => {
		expectedData = EXPECTED_RAW_DATA.slice(0)
		await expectedOutput.addVersionToExpectedData(expectedData)
  })

	it('produce a json report', async () => {
		const { stdout, stderr } = await execAsPromise(`node ${scriptPath}`)
		const result = JSON.parse(stdout)
		const expectedJsonResult = expectedOutput.rawDataToJson(expectedData)

		assert.deepStrictEqual(result, expectedJsonResult)
	})

	it('produce a table report', async () => {
		const { stdout, stderr } = await execAsPromise(`node ${scriptPath} --output=table`)
		const expectedTableResult = expectedOutput.rawDataToTable(expectedData, EXPECTED_TABLE_TEMPLATE)

		assert.strictEqual(stdout, expectedTableResult)
	})

	it('produce a csv report', async () => {
		const { stdout, stderr } = await execAsPromise(`node ${scriptPath} --output=csv --csvHeaders`)
		const expectedCsvResult = expectedOutput.rawDataToCsv(expectedData, EXPECTED_CSV_TEMPLATE)

		assert.strictEqual(stdout, expectedCsvResult)
	})

	it('produce an html report', async () => {
		const { stdout, stderr } = await execAsPromise(`node ${scriptPath} --output=html`)
		const actualResult = eol.auto(stdout)
		const expectedHtmlTemplate = eol.auto(fs.readFileSync(path.join(__dirname, 'fixture', 'expectedOutput.e2e.html'), 'utf8'))
		const expectedHtmlResult = expectedOutput.rawDataToHtml(expectedData, expectedHtmlTemplate)

		assert.strictEqual(actualResult, expectedHtmlResult)
	})
})

// raw data we use to generate the expected results
const EXPECTED_RAW_DATA = [
	{
		author: 'Dan VerWeire, Yaniv Kessler',
		department: 'kessler',
		relatedTo: 'stuff',
		name: '@kessler/tableify',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'MIT',
		link: 'git+https://github.com/kessler/node-tableify.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
	{
		author: 'TJ Holowaychuk tj@vision-media.ca',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'debug',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'MIT',
		link: 'git://github.com/visionmedia/debug.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
  {
    author: 'Ryan Van Etten',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'eol',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'git+https://github.com/ryanve/eol.git',
    remoteVersion: '_VERSION_',
    installedVersion: '_VERSION_'
  },
	{
		author: '',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'got',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'MIT',
		link: 'git+https://github.com/sindresorhus/got.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
	{
		author: 'Dominic Tarr dominic.tarr@gmail.com dominictarr.com',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'rc',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: '(BSD-2-Clause OR MIT OR Apache-2.0)',
		link: 'git+https://github.com/dominictarr/rc.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
	{
		author: '',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'semver',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'ISC',
		link: 'git+https://github.com/npm/node-semver.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
	{
		author: 'James Halliday mail@substack.net http://substack.net',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'text-table',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'MIT',
		link: 'git://github.com/substack/text-table.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
	{
		author: 'Yaniv Kessler',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'visit-values',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'MIT',
		link: 'https://github.com/kessler/node-visit-values',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	},
	{
		author: 'TJ Holowaychuk tj@vision-media.ca',
		department: 'kessler',
		relatedTo: 'stuff',
		name: 'mocha',
		licensePeriod: 'perpetual',
		material: 'material',
		licenseType: 'MIT',
		link: 'git+https://github.com/mochajs/mocha.git',
		remoteVersion: '_VERSION_',
		installedVersion: '_VERSION_'
	}
]

/*
	template for csv output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_CSV_TEMPLATE = `department,related to,name,license period,material / not material,license type,link,remote version,installed version,author
{{department}},{{relatedTo}},[[@kessler/tableify]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[debug]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[eol]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[got]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[rc]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[semver]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[text-table]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[visit-values]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
{{department}},{{relatedTo}},[[mocha]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{author}}
`

/*
	template for csv output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_TABLE_TEMPLATE = `{{department}}  {{relatedTo}}  {{name}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  {{name}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[@kessler/tableify]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[debug]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[eol]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[got]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[rc]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[semver]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[text-table]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[visit-values]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[mocha]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{author}}
`