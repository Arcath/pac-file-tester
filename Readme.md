# Pac File Tester

[![codecov](https://codecov.io/gh/Arcath/pac-file-tester/branch/master/graph/badge.svg?token=2R7fS9DBHW)](https://codecov.io/gh/Arcath/pac-file-tester)
[![buid status](https://img.shields.io/github/workflow/status/arcath/pac-file-tester/main?logo=github&style=flat-square)](https://github.com/arcath/pac-file-tester/actions?query=workflow%3Amain)
[![NPM](https://img.shields.io/npm/v/pac-file-tester.svg?style=flat-square)](https://www.npmjs.com/package/pac-file-tester)

Tests a PAC file and returns its output.

## Usage

### As a CLI tool

```bash
npm install pac-file-tester -g
pac-file-tester -f http://your.site/proxy.pac -u http://www.google.com

# or with npx

npx pac-file-tester -f http://your.site/proxy.pac -u http://www.google.com
```

#### Options

- -f --file, the url/path of the pac file to test.
- -u --url, the url to test the pac file against.
- -i --ip, the IP address to return from `myIpAddress()`
- -c --compare, the url/path of another pac file to compare output & speed with.
  (Optional)
- -d --dns, a manual DNS entry, e.g. `dns.google.com|8.8.8.8`

### Pragmatically

```
npm install --save pac-file-tester
```

```ts
import {testPacFile, getFileContents} from 'pac-file-tester'

const test = async () => {
  const script = await getFileContents('http://pac.domain.com/proxy.pac')

  const result = await testPacFile(script, 'https://www.google.com')
}
```
