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
  let result = '';
  for (let i = 0; i < config.proxies.length; i++) {
    const proxy = config.proxies[i];
    let name = proxy.name
    let type = proxy.type
    let server = proxy.server
    let port = proxy.port
    let network = proxy.network
    let skipCertVerify = proxy['skip-cert-verify']
    
    let uuid,alterId,security,tls,sni,password,path,host,grpcServiceName
    if (type === 'vmess') {
      //uuid, alterId, cipher, tls, servername
      uuid = proxy.uuid
      alterId = proxy.alterId
      security = proxy.cipher
      tls = proxy.tls
      sni = proxy.servername
    } else if (proxy.type === 'vless') {
      //uuid, tls, servername, cipher
      uuid = proxy.uuid
      //security = proxy.cipher
      tls = proxy.tls
      sni = proxy.servername
    } else if (proxy.type === 'trojan') {
      // password, sni
      password = proxy.password
      sni = proxy.sni
    }
    if (proxy.network === 'ws') {
      path = proxy['ws-opts'].path
      host = proxy['ws-opts'].headers.Host
    } else if (proxy.network === 'grpc') {
      grpcServiceName = proxy['grpc-opts']['grpc-service-name']
    }
    console.log('===');
    const configUrls = {
      trojan: {
        ws: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/trojan-ws.json',
        grpc: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/trojan-grpc.json',
        gfw: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/trojan-gfw.json',
      },
      vmess: {
        ws: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vmess-ws.json',
        grpc: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vmess-grpc.json',
      },
      vless: {
        ws: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vless-ws.json',
        grpc: 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vless-grpc.json',
      },
    };
    let configSing;
    if (type in configUrls) {
      const url =
        network in configUrls[type]
          ? configUrls[type][network]
          : type === 'trojan'
          ? configUrls[type].gfw
          : undefined;
      if (url) {
        const configSingResponse = await fetch(url);
        configSing = await configSingResponse.json();
      }
    };
    if (type === 'vmess' || type === 'vless') {
      configSing.type = type;
      configSing.tag = name;
      configSing.server = server;
      configSing.server_port = parseInt(port, 10);
      configSing.uuid = uuid;
      if (type === 'vmess') {
        configSing.alter_id = parseInt(alterId, 10);
        configSing.security = security;
      }
    
      if (network === 'ws') {
        configSing.transport.path = path;
        configSing.transport.headers.Host = host;
      }
    
      if (network === 'grpc') {
        configSing.transport.service_name = grpcServiceName;
      }
    
      if (tls) {
        configSing.tls.enabled = tls;
        configSing.tls.server_name = sni;
        configSing.tls.insecure = skipCertVerify;
      } else {
        delete configSing.tls;
      }
    }
    
    if (type === 'trojan') {
      configSing.type = type;
      configSing.tag = name;
      configSing.server = server;
      configSing.server_port = parseInt(port, 10);
      configSing.password = password;
      configSing.tls.server_name = sni;
      configSing.tls.insecure = skipCertVerify;
    
      if (network === 'ws') {
        configSing.transport.path = path;
        configSing.transport.headers.Host = host;
      }
      if (network === 'grpc') {
        configSing.transport.service_name = grpcServiceName;
      }
    }

    let formatted_json = JSON.stringify(configSing, null, 2);
    result += formatted_json
    if (i < config.proxies.length) {
      result += ',\n';
    }
    //console.log(formatted_json)
    //console.log('===');
  }
  console.log(result)
}

main();
/*
let result = '';
for (let i = 1; i <= 10; i++) {
    result += `Hello ${i}`;
    if (i < 10) {
        result += ',\n';
    }
}
console.log(result);
*/