#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import createDebugMessages from 'debug';

import { config } from './lib/config.js';
import { getFormatter } from './lib/getFormatter.js';
import { addLocalPackageData } from './lib/addLocalPackageData.js';
import { addPackageDataFromRepository } from './lib/addPackageDataFromRepository.js';
import { getDependencies } from './lib/getDependencies.js';
import { packageDataToReportData } from './lib/packageDataToReportData.js';
import { isNullOrUndefined, helpText, readJson } from './lib/util.js';

const debug = createDebugMessages('license-report');

(async () => {
  if (config.help) {
    console.log(helpText)
    return
  }

  if (!config.package) {
    config.package = './package.json'
  }

  if (path.extname(config.package) !== '.json') {
    throw new Error('invalid package.json ' + config.package)
  }

  const outputFormatter = getFormatter(config.output)

  try {
    const resolvedPackageJson = path.resolve(process.cwd(), config.package)

    debug('loading %s', resolvedPackageJson)
    let packageJson
    if (fs.existsSync(resolvedPackageJson)) {
      packageJson = await readJson(resolvedPackageJson)
    } else {
      throw new Error(`Warning: the file '${resolvedPackageJson}' is required to get installed versions of packages`)
    }
    
    // Get a list of all the dependencies we want information about.
    const inclusions = isNullOrUndefined(config.only) ? null : config.only.split(',')
    const exclusions = Array.isArray(config.exclude) ? config.exclude : [config.exclude]
    let exclusionRegexp
    if ((config.excludeRegex !== undefined)  && (typeof config.excludeRegex === 'string') && (config.excludeRegex !== '')) {
      try {
        exclusionRegexp = new RegExp(config.excludeRegex, 'i')
      } catch (error) {
        console.error(error.message)
        exclusionRegexp = undefined
      }
    }
    const fieldsList = Array.isArray(config.fields) ? config.fields : [config.fields]
    let depsIndex = getDependencies(packageJson, exclusions, inclusions, exclusionRegexp)

    const projectRootPath = path.dirname(resolvedPackageJson)
    const packagesData = await Promise.all(
      depsIndex.map(async (element) => {
        const localDataForPackage = await addLocalPackageData(element, projectRootPath, fieldsList)
        const completeDataForPackage = await addPackageDataFromRepository(localDataForPackage)
        return packageDataToReportData(completeDataForPackage, config)
      })
    )

    console.log(outputFormatter(packagesData, config))
  } catch (e) {
    console.error(e.stack)
    process.exit(1)
  }
})();
