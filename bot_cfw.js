import yaml from 'js-yaml';
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function fetchData(url) {
  let headers = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "Chrome/100"});
  const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,{method: 'GET',headers: headers})
  return response.text();
}

async function handleRequest(request) {
  if (request.method === "POST") {
    const payload = await request.json() 
    // Getting the POST request JSON payload
    if ('message' in payload) { 
      // Checking if the payload comes from Telegram
      const chatId = payload.message.chat.id
      const inputUrl = payload.message.text
      const inputData = inputUrl.startsWith("http") ? await fetchData(inputUrl) : inputUrl;
      const urlData = encodeURIComponent(inputData.replace(/\n/g, "|"));
      const targetUrl = `https://sub.bonds.id/sub?target=clash&url=${urlData}&insert=false&config=base%2Fdatabase%2Fconfig%2Fstandard%2Fstandard_redir.ini&emoji=false&list=true&udp=true&tfo=false&expand=false&scv=true&fdn=false&sort=false&new_name=true`;
      const text = await fetchData(targetUrl);
      const config = yaml.load(text);
      let hasil = [];
      let nameProxy = [];
      /*
      console.log(text)
      console.log(inputUrl)
      console.log(inputData)
      */
      for (let i = 0; i < config.proxies.length; i++) {
        const proxy = config.proxies[i];
        let name = proxy.name;
        let type = proxy.type;
        let server = proxy.server;
        let port = proxy.port;
        let network = proxy.network;
        let skipCertVerify = proxy["skip-cert-verify"];

        let uuid,
          alterId,
          security,
          tls,
          sni,
          password,
          path,
          host,
          grpcServiceName;
        if (type === "vmess") {
          uuid = proxy.uuid;
          alterId = proxy.alterId;
          security = proxy.cipher;
          tls = proxy.tls;
          sni = proxy.servername;
        } else if (type === "vless") {
          uuid = proxy.uuid;
          tls = proxy.tls;
          sni = proxy.servername;
        } else if (type === "trojan") {
          password = proxy.password;
          sni = proxy.sni;
        }
        if (proxy.network === "ws") {
          path = proxy["ws-opts"].path;
          host = proxy["ws-opts"].headers.Host;
        } else if (proxy.network === "grpc") {
          grpcServiceName = proxy["grpc-opts"]["grpc-service-name"];
        }
        const configUrls = {
          trojan: {
            ws: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/trojan-ws.json",
            grpc: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/trojan-grpc.json",
            gfw: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/trojan-gfw.json"
          },
          vmess: {
            ws: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vmess-ws.json",
            grpc: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vmess-grpc.json"
          },
          vless: {
            ws: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vless-ws.json",
            grpc: "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/v2ray/vless-grpc.json"
          }
        };
        let configSing;
        if (type in configUrls) {
          const url =
            network in configUrls[type] ?
            configUrls[type][network] :
            type === "trojan" ?
            configUrls[type].gfw :
            undefined;
          if (url) {
            const configSingResponse = await fetch(url);
            configSing = await configSingResponse.json();
          }
        }
        if (type === "vmess" || type === "vless") {
          configSing.type = type;
          configSing.tag = name;
          configSing.server = server;
          configSing.server_port = parseInt(port, 10);
          configSing.uuid = uuid;
          if (type === "vmess") {
            configSing.alter_id = parseInt(alterId, 10);
            configSing.security = security;
          }

          if (network === "ws") {
            configSing.transport.path = path;
            configSing.transport.headers.Host = host;
          }

          if (network === "grpc") {
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

        if (type === "trojan") {
          configSing.type = type;
          configSing.tag = name;
          configSing.server = server;
          configSing.server_port = parseInt(port, 10);
          configSing.password = password;
          configSing.tls.server_name = sni;
          configSing.tls.insecure = skipCertVerify;

          if (network === "ws") {
            configSing.transport.path = path;
            configSing.transport.headers.Host = host;
          }
          if (network === "grpc") {
            configSing.transport.service_name = grpcServiceName;
          }
        }
        hasil.push(configSing);
        nameProxy.push(name);
      }

      const baseConfigUrl = "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config.json";
      const baseConfigResponse = await fetch(baseConfigUrl);
      const baseConfig = await baseConfigResponse.json();

      baseConfig.outbounds.forEach(outbound => {
        if (["Internet", "Best Latency", "Lock Region ID"].includes(outbound.tag)) {
          outbound.outbounds.push(...nameProxy);
        }
      });

      let addProxy = baseConfig.outbounds.findIndex(outbound => outbound.tag === 'Lock Region ID');
      baseConfig.outbounds.splice(addProxy + 1, 0, ...hasil);

      let formattedBaseConfig = JSON.stringify(baseConfig, null, 2);

      var blob = new Blob([formattedBaseConfig], {type: 'plain/text'});
      let date = new Date();
      let dateString = date.toLocaleDateString('id-ID').replace(/\//g, '-');
      let timeString = date.toLocaleTimeString('id-ID');
      let fileName = `sfa-${dateString}-${timeString}.txt`;

      var formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', blob, fileName);
      const urel = `https://api.telegram.org/bot${API_KEY}/sendDocument`
      const daita = await fetch(urel, {method: 'POST',body: formData}).then(resp => resp.json());
    }
  }
  return new Response("OK") // Doesn't really matter
}