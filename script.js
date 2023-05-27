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
    console.log(proxy.name);
    console.log(proxy.type);
    console.log(proxy.server);
    console.log(proxy.port);
    console.log('===')
  }
}

main();
