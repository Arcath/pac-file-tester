const dns = require('dns')
const download = require('download-file')
const fs = require('fs')
const http = require('http')
const ip = require('ip')
const path = require('path')
const vm = require('vm')

module.exports = {
  ip: ip.address(),

  getResult(pacFile, url, cb){
    fs.readFile(pacFile, function(err, data){
      var host = module.exports.getHost(url)
      var script = new vm.Script(data + ' result = FindProxyForURL("' + url + '", "' + host + '")')

      dnsResults = {
        localhost: '127.0.0.1'
      }

      dns.resolve4(host, function(err, addresses){
        dnsResults[host] = addresses[0]

        module.exports.runPAC(url, script, dnsResults, function(result){
          cb(result)
        })
      })
    })
  },

  runPAC(url, script, dnsResults, cb){
    // Taken from the Mozilla PAC file parser (https://dxr.mozilla.org/mozilla/source/netwerk/base/src/nsProxyAutoConfig.js)
    var myIp = module.exports.ip
    var context = vm.createContext({
      myIpAddress: function(){
        return myIp
      },

      shExpMatch: function(url, pattern) {
         pattern = pattern.replace(/\./g, '\\.');
         pattern = pattern.replace(/\*/g, '.*');
         pattern = pattern.replace(/\?/g, '.');
         var newRe = new RegExp('^'+pattern+'$');
         return newRe.test(url);
      },

      isInNet: function(addr, network, mask){
        return ip.subnet(network, mask).contains(addr)
      },

      dnsResults: dnsResults,
      dnsResolve: function(host){
        return dnsResults[host]
      }
    })

    script.runInContext(context)

    cb(context.result)
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
