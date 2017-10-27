const dnsSync = require('dns-sync')
const download = require('download-file')
const fs = require('fs')
const http = require('http')
const ip = require('ip')
const path = require('path')

// Taken from the Mozilla PAC file parser (https://dxr.mozilla.org/mozilla/source/netwerk/base/src/nsProxyAutoConfig.js)
global.shExpMatch = function(url, pattern) {
   pattern = pattern.replace(/\./g, '\\.');
   pattern = pattern.replace(/\*/g, '.*');
   pattern = pattern.replace(/\?/g, '.');
   var newRe = new RegExp('^'+pattern+'$');
   return newRe.test(url);
}

global.isInNet = function(addr, network, mask){
  return ip.subnet(network, mask).contains(addr)
}

global.dnsCache = {}
global.dnsResolve = function(host){
  if(dnsCache[host]){
    return dnsCache[host]
  }else{
    var result = dnsSync.resolve(host)
    dnsCache[host] = result
    return result
  }
}

module.exports = {
  ip: ip.address(),

  prepareFile(filePath, cb){
    fs.readFile(filePath, function(err, data){
      var contents = data.toString()

      contents = contents.replace(/function FindProxyForURL/m, 'module.exports = function')

      var writeTo = path.join(__dirname, '..', 'temp', 'prepared.js')

      fs.writeFile(writeTo, contents, function(err){
        delete require.cache[require.resolve(path.join(__dirname, '..', 'temp', 'prepared.js'))]
        cb()
      })
    })
  },

  getResult(pacFile, url, cb){
    // Provide the machines IP (or a stubbed one)
    global.myIpAddress = function(){
      return module.exports.ip
    }

    this.prepareFile(pacFile, function(err){
      module.exports.runPAC(url, cb)
    })
  },

  runPAC(url, cb){
    var pac = require(path.join(__dirname, '..', 'temp', 'prepared.js'))

    cb(pac(url, module.exports.getHost(url)))
  },

  getHost(url){
    var regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im

    var match = regex.exec(url)

    return match[1]
  },

  downloadFile(url, name, cb){
    download(url, {
      directory: path.join(__dirname, '..', 'temp'),
      filename: name
    }, function(err){
      cb()
    })
  }
}
