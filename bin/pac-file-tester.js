#!/usr/bin/env node

const Benchmark = require('benchmark')
const path = require('path')
const program = require('commander')
const pft = require('../lib/pac-file-tester')

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

if (!program.file) {
  console.log('No PAC File supplied')
  return
}

if (!program.url) {
  console.log('No URL supplied')
  return
}

const run = async url => {
  console.log(url)
  const script = await pft.getFileContents(url)

  if (program.dns) {
    const [host, ip] = program.dns.split('|')

    pft.addToDNSCache(host, ip)
  }

  const result = await pft.testPacFile(script, program.url, program.ip)

  console.log(result)
}

const runCompare = async () => {
  await run(program.file)
  await run(program.compare)

  const script1 = await pft.getFileContents(program.file)
  const script2 = await pft.getFileContents(program.compare)

  const suite = new Benchmark.Suite()

  suite
    .add(
      'File 1',
      async deffered => {
        await pft.testPacFile(script1, program.url, program.ip)
        deffered.resolve()
      },
      {defer: true}
    )
    .add(
      'File 2',
      async deffered => {
        await pft.testPacFile(script2, program.url, program.ip)
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

if (!program.compare) {
  run(program.file)
} else {
  runCompare()
}
