function FindProxyForURL(url, host){
  if(shExpMatch(host, "google.com")){
    return "PROXY myproxy.com:8080";
  }

  return "DIRECT";
}
