#!/usr/bin/env node

const Benchmark = require('benchmark')
const path = require('path')
const program = require('commander')
const pft = require('../lib/pac-file-tester')
const {resolve} = require('dns-sync')

const pkg = require(path.join(__dirname, '..', 'package.json'))

program
  .version(pkg.version)
  .option('-f --file <url>', 'PAC File to test')
  .option('-u --url <url>', 'URL to supply for testing')
  .option(
    '-i --ip <ip>',
    'The IP to supply to the PAC file (defaults to your own)'
  )
  .option('-c --compare <url>', 'URL of another PAC file to compare to')
  .option(
    '-d --dns <string>',
    'Manual DNS entry in the form HOST|IP e.g. google.com|8.8.8.8'
  )
  .parse(process.argv)

const {file, url, dns, ip, compare} = program.opts()

if (!file) {
  console.log('No PAC File supplied')
  return
}

if (!url) {
  console.log('No URL supplied')
  return
}

const run = async (pacUrl, dnsEntries) => {
  console.log(pacUrl)
  const script = await pft.getFileContents(pacUrl)

  if (dns) {
    const [host, ip] = dns.split('|')

    dnsEntries[host] = ip
  }

  const result = await pft.testPacFile(script, url, {ip, dnsEntries})

  console.log(result)
}

const runCompare = async () => {
  const dnsEntries = {}

  const host = pft.getHost(url)
  dnsEntries[host] = resolve(host)

  await run(file, dnsEntries)
  await run(compare, dnsEntries)

  const script1 = await pft.getFileContents(file)
  const script2 = await pft.getFileContents(compare)

  const suite = new Benchmark.Suite()

  suite
    .add(
      'File 1',
      async deffered => {
        await pft.testPacFile(script1, url, ip)
        deffered.resolve()
      },
      {defer: true}
    )
    .add(
      'File 2',
      async deffered => {
        await pft.testPacFile(script2, url, ip)
        deffered.resolve()
      },
      {defer: true}
    )
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({async: true})
}

if (!compare) {
  run(file, {})
} else {
  runCompare()
}
