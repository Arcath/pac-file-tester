function FindProxyForURL(url, host){
  if(isPlainHostName(host)){
    return "PROXY myproxy.com:8080";
  }

  return "DIRECT";
}