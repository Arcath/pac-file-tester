# Pac File Tester

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

```js
cost PACFileTester = require('pac-file-tester')

PACFileTester.getResult('/path/to/proxy.pac', 'http://some.site.com', function(result){
  console.log(result)
})
```
