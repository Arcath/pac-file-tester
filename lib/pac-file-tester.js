const dns = require('dns')
const download = require('download-file')
const fs = require('fs')
const http = require('http')
const ip = require('ip')
const path = require('path')
const vm = require('vm')

module.exports = {
  ip: ip.address(),
  dnsCache: {},

  getResult(pacFile, url, cb){
    fs.readFile(pacFile, function(err, data){
      var host = module.exports.getHost(url)
      var script = new vm.Script(data + ' result = FindProxyForURL("' + url + '", "' + host + '")')

      dnsResults = {
        localhost: '127.0.0.1'
      }

      if(!module.exports.dnsCache.localhost){
        dns.resolve4(host, function(err, addresses){
          if(!addresses){
            dnsResults[host] = host
          }else{
            dnsResults[host] = addresses[0]
          }
  
          module.exports.dnsCache = dnsResults
          module.exports.runPAC(url, script, dnsResults, function(result){
            cb(result)
          })
        })
      }else{
        module.exports.runPAC(url, script, module.exports.dnsCache, function(result){
          cb(result)
        })
      }
    })
  },

  runPAC(url, script, dnsResults, cb){
    // Taken from the Mozilla PAC file parser (https://dxr.mozilla.org/mozilla/source/netwerk/base/src/nsProxyAutoConfig.js)
    var myIp = module.exports.ip
    var context = vm.createContext({
      console: console,
      
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

      isInNet: function(ipaddr, pattern, maskstr){
        function convert_addr(ipchars){
          var bytes = ipchars.split('.');
          var result = ((bytes[0] & 0xff) << 24) |
            ((bytes[1] & 0xff) << 16) |
            ((bytes[2] & 0xff) <<  8) |
            (bytes[3] & 0xff);
          return result;
        }

        var test = ipaddr.split('.')
        if (test == null) {
          ipaddr = dnsResolve(ipaddr);
          if (ipaddr == null)
            return false;
        } else if (test[1] > 255 || test[2] > 255 || test[3] > 255 || test[4] > 255) {
          return false;    // not an IP address
        }
        var host = convert_addr(ipaddr);
        var pat  = convert_addr(pattern);
        var mask = convert_addr(maskstr);
        return ((host & mask) == (pat & mask));
      },

      dnsResults: dnsResults,
      dnsResolve: function(host){
        return dnsResults[host]
      },

      isPlainHostName: function(host){
        return (host.search('\\\\.') == -1);
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
