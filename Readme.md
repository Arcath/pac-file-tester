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

#### `getFileContents(url: string): Promise<string>`

Returns the contents of the given url, suppports `http` and `file` addresses.

```ts
const contents = await getFileContents('http://pac.example.com/proxy.pac')
```

#### `testPacFile(file: string, url: string, options: Options)`

Tests the PAC file for the given url.

Takes an optional options object with the following keys:

| Key        |      Default      | Description                                                                 |
| :--------- | :---------------: | :-------------------------------------------------------------------------- |
| ip         | _your current ip_ | The IP Address to return for `myIpAddress()`                                |
| dnsEntries |       `{}`        | DNS Entries to supply to the context. e.g. `{'www.example.com': '1.2.3.4'}` |

##### Examples

###### Local file

Run a PAC file from disk for `https://www.google.com`.

```ts
const file = await getFileContents('file://./proxy.pac')

const result = await testPacFile(file, 'https://www.google.com')
```

##### Remote file with replaced IP

Run a PAC file from a web server for `https://www.google.com` whilst
impersonating the IP address `192.168.2.10`.

```ts
const file = await getFileContents('http://pac.example.com/proxy.pac')

const result = await testPacFile(file, 'https://www.google.com', {
  ip: '192.168.2.10'
})
```

##### Remote file with a custom DNS entry

Run a PAC file from a web server for `https://www.google.com` with a custom DNS
entry for `example.com` that resolves to `127.0.0.1`

```ts
const file = await getFileContents('http://pac.example.com/proxy.pac')

const result = await testPacFile(file, 'https://www.google.com', {
  dnsEntries: {'example.com': '127.0.0.1'}
})
```
