const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fetch = require('node-fetch');
const port = process.env.PORT || 5000;
let app = express();
let server = http.createServer(app);

let io = socketIO(server);

function findPage(n_page, html) {
	let start = html.indexOf(`<span class="mw-headline" id="Pag._${n_page}">`);
	let end;
	if(['13', '21', '31', '39', '47', '57', '65', '73', '83'].includes(n_page))
		end = html.indexOf(`<span class="mw-headline" id="Unit`, start + 1);
	else if(n_page == 194)
		end = html.indexOf(`</div`, start + 1);
	else
		end = html.indexOf(`<span class="mw-headline" id="Pag.`, start + 1);
	if(html.slice(start, end) == '') return 'Nessun Esercizio Trovato</h3>';
	return html.slice(start, end);
}

app.use(express.static(__dirname + "/../public"));
server.listen(port, () => {
	console.log('SERVER running on port: ', port);
});

io.on('connection', (socket) => {
	socket.on('get', async (num) => {
		let html = (await (await fetch('https://solu.zone/wiki/Language_for_life_B1')).text());

		socket.emit('set', findPage(num, html));
	})
});