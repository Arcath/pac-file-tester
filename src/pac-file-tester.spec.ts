import {testPacFile, addToDNSCache} from './pac-file-tester'

const DIRECT = `DIRECT`
const PROXY = `PROXY myproxy.com:8080`
const TEST_HOST = `www.ed-itsolutions.com`
const TEST_IP = `206.189.18.50`
const MANUAL_HOST = `foo.bar`
const MANUAL_IP = `172.16.0.1`

const DIRECT_PAC = `function FindProxyForURL(url, host){
  return "${DIRECT}"
}`

const PROXY_GOOGLE_PAC = `function FindProxyForURL(url, host){
  if(shExpMatch(host, "*.google.com")){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`

const PROXY_SUBNET_PAC = `function FindProxyForURL(url, host){
  if(isInNet(myIpAddress(), '10.0.0.0', '255.255.255.0')){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`

const DNS_RESOLVE_PAC = `function FindProxyForURL(url, host){
  if(isInNet(dnsResolve(host), '127.0.0.0', '255.255.255.0')){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`

const IS_PLAIN_HOSTNAME_PAC = `function FindProxyForURL(url, host){
  if(isPlainHostName(host)){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`

const DNS_RESOLVE_EXTRA_PAC = `function FindProxyForURL(url, host){
  if(isInNet(dnsResolve('${TEST_HOST}'), '${TEST_IP}', '255.255.255.255')){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`

const DNS_RESOLVE_MANUAL_PAC = `function FindProxyForURL(url, host){
  if(isInNet(dnsResolve('${MANUAL_HOST}'), '${MANUAL_IP}', '255.255.255.255')){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`

const PROXY_SUBDOMAIN_PAC = `function FindProxyForURL(url, host){
  if(dnsDomainIs(host, ".ed-itsolutions.com")){
    return "${PROXY}";
  }

  return "${DIRECT}";
}`


describe('Test Pac File', () => {
  it('should return a result', async () => {
    const result = await testPacFile(DIRECT_PAC, 'https://www.google.com')

    expect(result).toBe(DIRECT)
  })

  it('should support shExpMatch', async () => {
    let result = await testPacFile(PROXY_GOOGLE_PAC, 'https://www.google.com')

    expect(result).toBe(PROXY)

    result = await testPacFile(PROXY_GOOGLE_PAC, 'https://www.foo.com')

    expect(result).toBe(DIRECT)
  })

  it('should support isInNet', async () => {
    let result = await testPacFile(PROXY_SUBNET_PAC, 'https://www.google.com', '10.0.0.1')

    expect(result).toBe(PROXY)

    result = await testPacFile(PROXY_SUBNET_PAC, 'https://www.google.com', '10.0.2.1')

    expect(result).toBe(DIRECT)
  })

  it('should support dnsResolve', async () => {
    let result = await testPacFile(DNS_RESOLVE_PAC, 'https://localhost')

    expect(result).toBe(PROXY)

    result = await testPacFile(DNS_RESOLVE_PAC, 'https://www.google.com')

    expect(result).toBe(DIRECT)

    result = await testPacFile(DNS_RESOLVE_EXTRA_PAC, 'https://www.google.com')

    expect(result).toBe(PROXY)

    addToDNSCache(MANUAL_HOST, MANUAL_IP)

    result = await testPacFile(DNS_RESOLVE_MANUAL_PAC, 'https://www.google.com')

    expect(result).toBe(PROXY)
  })

  it('should support isPlainHostname', async () => {
    let result = await testPacFile(IS_PLAIN_HOSTNAME_PAC, 'https://localhost')
    expect(result).toBe(PROXY)

    result = await testPacFile(IS_PLAIN_HOSTNAME_PAC, 'https://www.google.com')
    expect(result).toBe(DIRECT)

  })

  it('should support dnsDomainIs', async () => {
    let result = await testPacFile(PROXY_SUBDOMAIN_PAC, `https://${TEST_HOST}`)
    expect(result).toBe(PROXY)

    result = await testPacFile(PROXY_SUBDOMAIN_PAC, 'https://www.google.com')
    expect(result).toBe(DIRECT)

  })

  

})