const expect = require('chai').expect
const PACFileTester = require('../lib/pac-file-tester')
const path = require('path')

describe('Prepare', function(){
  it('should prepare the file', function(done){
    PACFileTester.prepareFile(path.join(__dirname, 'fixtures', 'direct.pac'), function(){
      done()
    })
  })
})
