import yaml from 'js-yaml';
addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})
async function handleRequest(request) {
    if (request.method === "POST") {
        const payload = await request.json()
        if ('message' in payload) {
            const chatId = payload.message.chat.id;
            let text = payload.message.text;
            let parse = 'markdown';
            const apiKey = API_KEY;
            try {
                const uerel = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${output}&parse_mode=${parse}`;
                const daita = await fetch(uerel).then(resp => resp.json())
            } catch (error) {
                console.log('Error: ' + error.message);
            }
        }
    }
    return new Response("OK")
}
