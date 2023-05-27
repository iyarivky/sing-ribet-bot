import yaml from 'js-yaml';

async function fetchData(url) {
  const response = await fetch(url);
  return response.text();
}

async function main() {
  const inputUrl = 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/testakun.txt';
  //const inputUrl = ''
  const inputData = inputUrl.startsWith('http') ? await fetchData(inputUrl) : inputUrl;
  const urlData = encodeURIComponent(inputData.replace(/\n/g, "|"));
  const targetUrl = `https://sub.bonds.id/sub?target=clash&url=${urlData}&insert=false&config=base%2Fdatabase%2Fconfig%2Fstandard%2Fstandard_redir.ini&emoji=false&list=true&udp=true&tfo=false&expand=false&scv=true&fdn=false&sort=false&new_name=true`;
  const text = await fetchData(targetUrl);
  console.log(text);
  const config = yaml.load(text);
  console.log(config);
  for (let i = 0; i < config.proxies.length; i++) {
    const proxy = config.proxies[i];
    let name = proxy.name
    let type = proxy.type
    let server = proxy.server
    let port = proxy.port
    let network = proxy.network
    let skipCertVerify = proxy['skip-cert-verify']
    console.log('Name:',name);
    console.log('Type:',type);
    console.log('Server:',server);
    console.log('Port:',port);
    console.log('Network:',network);
    console.log('Koneksi Tidak Aman:',skipCertVerify);
    if (type === 'vmess') {
      //uuid, alterId, cipher, tls, servername
      let uuid = proxy.uuid
      let alterId = proxy.alterId
      let security = proxy.cipher
      let tls = proxy.tls
      let sni = proxy.servername
      console.log('UUID:',uuid)
      console.log('alterId:',alterId)
      console.log('Security:',security)
      console.log('TLS:',tls)
      console.log('SNI:',sni)
    } else if (proxy.type === 'vless') {
      //uuid, tls, servername, cipher
      let uuid = proxy.uuid
      let security = proxy.cipher
      let tls = proxy.tls
      let sni = proxy.servername
      console.log('UUID:',uuid)
      console.log('Security:',security)
      console.log('TLS:',tls)
      console.log('SNI:',sni)
    } else if (proxy.type === 'trojan') {
      // password, sni
      let password = proxy.password
      let sni = proxy.sni 
      console.log('Password:',password)
      console.log('SNI:',sni)
    }
    if (proxy.network === 'ws') {
      let path = proxy['ws-opts'].path
      let host = proxy['ws-opts'].headers.Host
      console.log('Path:',path);
      console.log('Host:',host);
    } else if (proxy.network === 'grpc') {
      let grpcServiceName = proxy['grpc-opts']['grpc-service-name']
      console.log('grpc service name:',grpcServiceName);
    }
    console.log('===')
  }
}

main();
