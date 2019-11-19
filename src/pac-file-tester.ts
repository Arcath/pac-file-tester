import {address} from 'ip'
import {resolve4} from 'dns'
import vm from 'vm'

const dnsCache: {[address: string]: string} = {
  localhost: '127.0.0.1'
}

export const testPacFile = async (file: string, url: string, ip: string = address()): Promise<string> => {
  const host = getHost(url)  
  const script = `${file}\r\nresult = FindProxyForURL("${url}", "${host}")`

  if(!dnsCache[host]){
    dnsCache[host] = await new Promise((resolve) => {
      resolve4(host, (err, addresses) => {
        if(!addresses){
          resolve(host)
        }

        resolve(addresses[0])
      })
    })
  }

  const sandbox = new vm.Script(script)
  const context = vmContext(ip)

  sandbox.runInContext(context)

  return context.result as string
}

export const getHost = (url: string): string => {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im

  const match = regex.exec(url)

  return match[1]
}

const vmContext = (ip: string) => {
  const dnsResolve = (host: string) => {
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
    return (host.search('\\\\.') == -1);
  }

  return vm.createContext({
    console: console,
    myIpAddress,
    shExpMatch,
    isInNet,
    dnsResolve,
    isPlainHostName
  })
}