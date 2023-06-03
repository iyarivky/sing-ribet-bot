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

async function getData() {
  let akun = "https://pastebin.com/raw/hPsEFHmG"; // your mom account
  let inputData = akun.startsWith("http")
    ? await fetchUrlAllOrigin(akun)
    : akun;
  inputData = inputData.replace(/\r?\n/g, ",");
  inputData = inputData.replace(/,$/g, "");
  let parseConfig = await fetchFoolAPI(inputData);
  const outboundsConfig = parseConfig.map(item => item.Outbound);
  outboundsConfig.forEach(item => {
    item.multiplex = {
      enabled: false,
      protocol: 'smux',
      max_streams: 32
    };
});
  console.log(outboundsConfig);
  let nameProxy = outboundsConfig.map(item => item.tag);
  console.log(nameProxy);
  
  const baseConfigUrl = "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config.json";
  const baseConfigResponse = await fetch(baseConfigUrl);
  const baseConfig = await baseConfigResponse.json();
  baseConfig.outbounds.forEach(outbound => {
    if (["Internet", "Best Latency", "Lock Region ID"].includes(outbound.tag)) {
      outbound.outbounds.push(...nameProxy);
    }
  });
  let addProxy = baseConfig.outbounds.findIndex(outbound => outbound.tag === 'Lock Region ID');
  baseConfig.outbounds.splice(addProxy + 1, 0, ...outboundsConfig);

  let formattedBaseConfig = JSON.stringify(baseConfig, null, 2);
  console.log(formattedBaseConfig)

}
getData();
