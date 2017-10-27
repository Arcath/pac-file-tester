const expect = require('chai').expect
const ip = require('ip')
const PACFileTester = require('../lib/pac-file-tester')
const path = require('path')

describe('Result Testing', function(){
  it('should get the host name', function(){
    expect(PACFileTester.getHost('https://www.google.com')).to.equal('google.com')
    expect(PACFileTester.getHost('https://www.google.com/foo/bar')).to.equal('google.com')
    expect(PACFileTester.getHost('https://google.com')).to.equal('google.com')
  })

  it('should return direct for the direct pac file', function(done){
    PACFileTester.getResult(path.join(__dirname, 'fixtures', 'direct.pac'), 'https://www.google.com', function(result){
      expect(result).to.equal("DIRECT")
      done()
    })
  })

  it('should return a proxy for google and not for any other domain using the proxyGoogle pac file', function(done){
    PACFileTester.getResult(path.join(__dirname, 'fixtures', 'proxyGoogle.pac'), 'https://www.google.com', function(result){
      expect(result).to.equal("PROXY myproxy.com:8080")
      PACFileTester.getResult(path.join(__dirname, 'fixtures', 'proxyGoogle.pac'), 'https://www.foobar.com', function(result){
        expect(result).to.equal("DIRECT")
        done()
      })
    })
  })

  it('should return a proxy if the IP is in a given subnet', function(done){
    PACFileTester.ip = '10.0.0.1'
    PACFileTester.getResult(path.join(__dirname, 'fixtures', 'proxySubnet.pac'), 'https://www.google.com', function(result){
      expect(result).to.equal("PROXY myproxy.com:8080")

      PACFileTester.ip = '10.1.2.3'
      PACFileTester.getResult(path.join(__dirname, 'fixtures', 'proxySubnet.pac'), 'https://www.google.com', function(result){
        expect(result).to.equal("DIRECT")
        done()
      })
    })
  })

  it('should return a proxy for localhost using DNS resolution', function(done){
    PACFileTester.getResult(path.join(__dirname, 'fixtures', 'dnsResolve.pac'), 'https://localhost', function(result){
      expect(result).to.equal("PROXY myproxy.com:8080")
      PACFileTester.getResult(path.join(__dirname, 'fixtures', 'dnsResolve.pac'), 'https://www.foobar.com', function(result){
        expect(result).to.equal("DIRECT")
        PACFileTester.getResult(path.join(__dirname, 'fixtures', 'dnsResolve.pac'), 'https://www.foobar.com', function(result){
          expect(result).to.equal("DIRECT")
          done()
        })
      })
    })
  })
})
