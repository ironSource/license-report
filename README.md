# license report tool
generate license report of a project's dependencies

### install 
```
npm install -g license-report
```

### usage

#### simple:
```
cd your/project/
license-report
```
by default, `license-report` outputs all licenses from `dependencies` and `devDependencies`.
To specify one or the other, use `--only`
```
license-report --only=dev
```
```
license-report --only=prod
```

#### explicit package.json:
```
license-report --package=/path/to/package.json
```

#### customize a field's label:
Used as column headers in table / csv / html output. For html output the labels of all fields in the output must be unique.
```
license-report --department.label=division
```

#### customize a fields default value:
Only applicable for the fields in the list later in this document (look for "Fields with data set in the configuration of license-report")
```
license-report --department.value=ninjaSquad
```

#### another registry:
```
license-report --registry=https://myregistry.com/
```

#### private registry:
```
# if the name of the environment variable containing the bearer token for npm authorization is 'NPM_TOKEN'
license-report --registry=https://myregistry.com/ --npmTokenEnvVar=NPM_TOKEN
```

#### different outputs:
```
license-report --output=table
license-report --output=json
license-report --output=csv
license-report --output=html

# replace default ',' separator with something else
license-report --output=csv --delimiter="|" 

# output csv headers (fields) on first row
license-report --output=csv --csvHeaders

# use custom stylesheet for html output
license-report --output=html --html.cssFile=/a/b/c.css

# see the output immediately in your browser, use hcat (npm i -g hcat)
license-report --output=html | hcat
```

#### select fields for output:
```
# set options with command line options and config file
license-report --output=csv --config license-report-config.json
```
```
# example of config file for backward compatible output:
{
  "fields": [
    "department",
    "relatedTo",
    "name",
    "licensePeriod",
    "material",
    "licenseType",
    "link",
    "comment",
    "installedVersion",
    "author"
  ]
}
```

#### exclude:
```
license-report --exclude=async --exclude=rc
```

### screenshots

![screenshot](screenshot.png)
![screenshot1](html.png)

### available fields
Fields with data of the installed packages:
| fieldname | column title | data source |
|---|---|---|
| name | name | name of the package |
| licenseType | license type | type of the license of the package (e.g. MIT) |
| link | link | link to the repository of the package |
| remoteVersion | remoteVersion | latest available version of the package (can be different from the installed version) |
| installedVersion | installedVersion | installed version of the package (can be different from the remote version) |
| comment | comment | deprecated (replaced by field 'remoteVersion'); will be removed in a future version |
| author | author | author of the package |

Fields with data set in the configuration of license-report:
| fieldname | column title | set value |
|--|---|---|
| department | department | --department.value=kessler |
| relatedTo | related to | --relatedTo.value=stuff |
| licensePeriod | license period | --licensePeriod.value=perpetual |
| material | material / not material | --material.value=material |

### debug
```
export DEBUG=license-report*
```

see lib/config.js for more details

use [rc](https://github.com/dominictarr/rc) for further customization

![ironSource logo](ironsource.png)
