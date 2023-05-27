import yaml from 'js-yaml';

async function fetchData(url) {
  const response = await fetch(url);
  return response.text();
}

async function main() {
  const inputUrl = 'https://raw.githubusercontent.com/iyarivky/sing-ribet/main/testakun.txt';
  const inputData = inputUrl.startsWith('http') ? await fetchData(inputUrl) : inputUrl;
  const urlData = encodeURIComponent(inputData.replace(/\n/g, "|"));
  const targetUrl = `https://sub.bonds.id/sub?target=clash&url=${urlData}&insert=false&config=base%2Fdatabase%2Fconfig%2Fstandard%2Fstandard_redir.ini&emoji=false&list=true&udp=true&tfo=false&expand=false&scv=true&fdn=false&sort=false&new_name=true`;
  const text = await fetchData(targetUrl);
  console.log(text);
  const config = yaml.load(text);
  console.log(config);
}

main();
