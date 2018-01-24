#!/usr/bin/env node

const Benchmark = require('benchmark')
const fs = require('fs')
const PACFileTester = require('../lib/pac-file-tester')
const path = require('path')
const program = require('commander')

const pkg = require(path.join(__dirname, '..', 'package.json'))


program
  .version(pkg.version)
  .option('-f --file <url>', 'PAC File to test')
  .option('-u --url <url>', 'URL to supply for testing')
  .option('-i --ip <ip>', 'The IP to supply to the PAC file (defaults to your own)')
  .option('-c --compare <url>', 'URL of another PAC file to compare to')
  .parse(process.argv)

if(!program.file){
  console.log('No PAC File supplied')
  return
}

if(!program.url){
  console.log('No URL supplied')
  return
}

if(program.file.substr(0,4) === 'http'){
  PACFileTester.downloadFile(program.file, 'proxy.pac', function(err){
    runTest(path.join(__dirname, '..', 'temp', 'proxy.pac'))
  })
}else{
  runTest(program.file)
}

if(program.ip){
  PACFileTester.ip = program.ip
}

var runTest = function(file){
  if(!program.compare){
    PACFileTester.getResult(file, program.url, function(result){
      console.log(result)
    })
  }else{
    if(program.compare.substr(0,4) === 'http'){
      PACFileTester.downloadFile(program.compare, 'compare.pac', function(err){
        runCompare(file, path.join(__dirname, '..', 'temp', 'compare.pac'))
      })
    }else{
      runCompare(file, program.compare)
    }
  }
}

var runCompare = function(file1, file2){
  console.log('Comparing 2 Files')
  console.log('Getting Result')
  PACFileTester.getResult(file1, program.url, function(result){
    var stats = fs.statSync(file1)

    console.log('File 1: ' + result +  ' size: ' + (stats.size / 1000.00) + 'KB')
    PACFileTester.getResult(file2, program.url, function(result){
      var stats = fs.statSync(file2)

      console.log('File 2: ' + result +  ' size: ' + (stats.size / 1000.00) + 'KB')

      console.log('Benchmarking')

      var suite = new Benchmark.Suite

      var prepared1 = false
      var prepared2 = false

      suite.add('File 1', function(deffered){
        PACFileTester.getResult(file1, program.url, function(result){
          deffered.resolve()
        })
      }, {defer: true})
      .add('File 2', function(deffered){
        PACFileTester.getResult(file2, program.url, function(result){
          deffered.resolve()
        })
      }, {defer: true})
      .on('cycle', function(event) {
        console.log(String(event.target))
      })
      .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
      })
      .run({ 'async': true });
    })
  })
}
