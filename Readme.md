# Pac File Tester

[![Build Status](https://travis-ci.org/Arcath/pac-file-tester.svg?branch=master)](https://travis-ci.org/Arcath/pac-file-tester) [![Coverage Status](https://coveralls.io/repos/github/Arcath/pac-file-tester/badge.svg)](https://coveralls.io/github/Arcath/pac-file-tester)

Tests a PAC file and returns its output.

## Usage

### As a CLI tool

```
npm install pac-file-tester -g
pac-file-tester -f http://your.site/proxy.pac -u http://www.google.com
```

#### Options

 - -f --file, the url/path of the pac file to test.
 - -u --url, the url to test the pac file against.
 - -i --ip, the IP address to return from `myIpAddress()`, defaults to your primary IP. (Optional)
 - -c --compare, the url/path of another pac file to compare output & speed with. (Optional)

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
