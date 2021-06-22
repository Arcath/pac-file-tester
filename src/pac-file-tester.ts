import {address} from 'ip'
import vm from 'vm'
import http from 'http'
import fs from 'fs'

import {resolve} from 'dns-sync'

const dnsCache: {[address: string]: string} = {
  localhost: '127.0.0.1'
}

export const addToDNSCache = (host: string, ip: string) => {
  dnsCache[host] = ip
}

export const testPacFile = async (file: string, url: string, ip: string = address()): Promise<string> => {
  const host = getHost(url)  
  const script = `${file}\r\nresult = FindProxyForURL("${url}", "${host}")`

  if(!dnsCache[host]){
    dnsCache[host] = resolve(host)
  }

  const sandbox = new vm.Script(script)
  const context = vmContext(ip)

  sandbox.runInContext(context)

  return context.result as string
}

export const getHost = (url: string): string => {
  const urlObj = new URL(url);
  return urlObj.hostname
}

const vmContext = (ip: string) => {
  const dnsResolve = (host: string) => {
    if(dnsCache[host]){
      return dnsCache[host]
    }

    dnsCache[host] = resolve(host)

    if(dnsCache[host] === null){
      dnsCache[host] = '255.255.255.255'
    }

    return dnsCache[host]
  }

  const myIpAddress = () => ip

  const shExpMatch = (url: string, pattern: string) => {
    pattern = pattern.replace(/\./g, '\\.')
    pattern = pattern.replace(/\*/g, '.*')
    pattern = pattern.replace(/\?/g, '.')
    const newRe = new RegExp('^'+pattern+'$')
    return newRe.test(url);
  }

  const isInNet = (ipaddr: string, pattern: string, maskstr: string) => {
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
    }else if(
      parseInt(test[1]) > 255 ||
      parseInt(test[2]) > 255 ||
      parseInt(test[3]) > 255 ||
      parseInt(test[4]) > 255
    ){
      return false;    // not an IP address
    }
    var host = convert_addr(ipaddr);
    var pat  = convert_addr(pattern);
    var mask = convert_addr(maskstr);
    return ((host & mask) == (pat & mask));
  }

  const isPlainHostName = (host: string) => {
    return host.indexOf(".") === -1;
  }

  const dnsDomainIs = (host: string, domain: string) => {
    console.log(`${host} compare to ${domain}`);
    return host.endsWith(domain);
  }

  return vm.createContext({
    console: console,
    myIpAddress,
    shExpMatch,
    isInNet,
    dnsResolve,
    isPlainHostName,
    dnsDomainIs
  })
}

export const getFileContents = async (url) => {
  return new Promise((resolve) => {
    if(url.substr(0,4) === 'http'){
      // Download
      let content = ''

      http.get(url, (response) => {
        response.on('data', (chunk) => {
          content += chunk.toString()
        })

        response.on('end', () => {
          resolve(content)
        })
      })
    }else{
      // File
      resolve(fs.readFileSync(url).toString())
    }
  })
}