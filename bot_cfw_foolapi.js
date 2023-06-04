addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function fetchConfig(url) {
  const response = await fetch(url);
  return await response.json();
}

async function fetchFoolAPI(vRay) {
  let formDataAPI = new FormData();
  formDataAPI.append("urls", vRay);
  const url = `https://fool.azurewebsites.net/parse`;
  const result = await fetch(url, { method: "POST", body: formDataAPI });
  return result.json();
}

async function fetchUrlAllOrigin(url) {
  let headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "Chrome/100"
  });
  const response = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    {
      headers: headers
    }
  );
  return await response.text();
}

async function handleRequest(request) {
  if (request.method === "POST") {
    const payload = await request.json() 
    // Getting the POST request JSON payload
    if ('message' in payload) {
      const chatId = payload.message.chat.id
      const inputUrl = payload.message.text
      try{
        let inputData = inputUrl.startsWith("http") ? await fetchDataAllOrigin(inputUrl) : inputUrl;
        inputData = inputData.replace(/(\r?\n){1,2}/g, ",");
        inputData = inputData.replace(/,$/g, "");
        let parseConfig = await fetchFoolAPI(inputData);
        
        const outboundsConfig = parseConfig.map((item) => item.Outbound);
        outboundsConfig.forEach((item) => {
          item.multiplex = {
            enabled: false,
            protocol: "smux",
            max_streams: 32
          };
        });
        let tagCount = {};
        let nameProxy = outboundsConfig.map((item) => {
          let tag = item.tag;
          if (tag in tagCount) {
            tagCount[tag]++;
            return tag + ' ' + tagCount[tag];
          } else {
            tagCount[tag] = 1;
            return tag;
          }
        });

        outboundsConfig.forEach((item, index) => {
          item.tag = nameProxy[index];
        });
        //console.log(outboundsConfig);

        const urls = {
          sfa:
            "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config.json",
          sfaSimple:
            "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config-simple.json",
          bfm:
            "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config-bfm.json",
          bfmSimple:
            "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config-bfm-simple.json"
        };
        const configs = {};
        for (const [key, url] of Object.entries(urls)) {
          configs[key] = await fetchConfig(url);
        }

        const configNames = ["sfa", "sfaSimple", "bfm", "bfmSimple"];
        const tags = {
          sfa: ["Internet", "Best Latency", "Lock Region ID"],
          sfaSimple: ["Internet", "Best Latency"],
          bfm: ["Internet", "Best Latency", "Lock Region ID"],
          bfmSimple: ["Internet", "Best Latency"]
        };
      
        const findIndexTag = {
          sfa: "Lock Region ID",
          sfaSimple: "Best Latency",
          bfm: "Lock Region ID",
          bfmSimple: "Best Latency"
        };

        for (const name of configNames) {
          const config = configs[name];
          config.outbounds.forEach((outbound) => {
            if (tags[name].includes(outbound.tag)) {
              outbound.outbounds.push(...nameProxy);
            }
          });
          let addProxy = config.outbounds.findIndex(
            (outbound) => outbound.tag === findIndexTag[name]
          );
          config.outbounds.splice(addProxy + 1, 0, ...outboundsConfig);
        }
  
        for (const name of configNames) {
          let formattedConfig = JSON.stringify(configs[name], null, 2);
          //console.log(formattedConfig);
          var blob = new Blob([formattedConfig], {type: 'plain/text'});
          let date = new Date();
          let dateString = date.toLocaleDateString('id-ID').replace(/\//g, '-');
          let timeString = date.toLocaleTimeString('id-ID');
          let fileName = `${name}-${dateString}-${timeString}.json`;

          var formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('document', blob, fileName);
          const urel = `https://api.telegram.org/bot${API_KEY}/sendDocument`
          const daita = await fetch(urel, {method: 'POST',body: formData}).then(resp => resp.json());
        }
      } catch(error){
        let output = "Send the v2ray config link here. If you are sure the config link is correct but you haven't received the config json, pm me [@iya_rivvikyn](https://t.me/iya_rivvikyn)"
        let parse = "markdown"
        const uerel = `https://api.telegram.org/bot${API_KEY}/sendMessage?chat_id=${chatId}&text=${output}&parse_mode=${parse}`;
        const daital = await fetch(uerel).then(resp => resp.json());
        let photo = "https://user-images.githubusercontent.com/101973571/243159445-957eba3e-bc2f-4d8d-ac36-b45bc56680e7.png"
        let caption = "Example"
        const uerela = `https://api.telegram.org/bot${API_KEY}/sendPhoto?chat_id=${chatId}&photo=${photo}&caption=${caption}`;
        const daitala = await fetch(uerela).then(resp => resp.json());
        //console.log(daitala)
        console.log('Error: ' + error.message);
      }
    }
  }
  return new Response("OK") // Doesn't really matter
}
