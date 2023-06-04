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

async function getData() {
  let akun = "https://pastebin.com/raw/hPsEFHmG"; // your mom account
  let inputData = akun.startsWith("http")
    ? await fetchUrlAllOrigin(akun)
    : akun;
  inputData = inputData.replace(/\r?\n/g, ",");
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
  console.log(outboundsConfig);
  let nameProxy = outboundsConfig.map((item) => item.tag);
  console.log(nameProxy);

  const urls = {
    base:
      "https://raw.githubusercontent.com/iyarivky/sing-ribet/main/config/config.json",
    simple:
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
  console.log(configs.Base);

  const configNames = ["base", "simple", "bfm", "bfmSimple"];
  const tags = {
    base: ["Internet", "Best Latency", "Lock Region ID"],
    simple: ["Internet", "Best Latency"],
    bfm: ["Internet", "Best Latency", "Lock Region ID"],
    bfmSimple: ["Internet", "Best Latency"]
  };

  const findIndexTag = {
    base: "Lock Region ID",
    simple: "Best Latency",
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
    console.log(formattedConfig);
  }
}
getData();
