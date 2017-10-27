function FindProxyForURL(url, host){
  if(isInNet(myIpAddress(), '10.0.0.0', '255.255.255.0')){
    return "PROXY myproxy.com:8080";
  }

  return "DIRECT";
}
