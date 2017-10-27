const expect = require('chai').expect
const PACFileTester = require('../lib/pac-file-tester')
const path = require('path')

describe('Download', function(){
  it('should download a pac file', function(done){
    PACFileTester.downloadFile('http://pac.ed-itsolutions.com/proxy.pac', 'proxy.pac', function(){
      done()
    })
  })
})
