const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fetch = require('node-fetch');
const port = process.env.PORT || 5000;
const fs = require('fs');
let app = express();
let server = http.createServer(app);

let io = socketIO(server);

const html_b1 = `
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>B1 Soluzioni</title>

	<script data-ad-client="ca-pub-1721015419104917" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
		integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
</head>

<body>
	
<nav class="navbar fixed-top navbar-expand-sm navbar-dark bg-dark">
<div class="container">
<a class="navbar-brand mx-auto" href="/">B1 Language for Life<span style="color: rgb(170, 170, 170);"> Solutions</span></a>
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
	aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
	<span class="navbar-toggler-icon"></span>
</button>
<div style="margin-left: 100px !important" class="collapse navbar-collapse" id="navbarSupportedContent">
	<ul class="navbar-nav mr-auto">
		<li class="nav-item">
			<a class="nav-link" href="/">Home</a>
		</li>
		<li class="nav-item">
			<a class="nav-link" href="/a2">A2 Solutions</a>
		</li>
	</ul>
</div>
</div>
</nav>

	<div class="container" style="margin-top: 100px">
		<td>
			<tr>
				<div class="form-group">
					<label>Pagina:</label>
					<input type="text" id="pages" class="form-control" name="" id="" aria-describedby="helpId"
						placeholder="Inserisci SOLO il Numero della Pagina">
					<input id="cerca" style="width: 100%;margin-bottom: 20px; margin-top: 20px;" class="btn btn-primary" type="button" value="CERCA">
				</div>
			</tr>
		</td>
		<div id="result" style="margin-bottom: 20px;">

		</div>
	</div>
	<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
		integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous">
	</script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
		integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous">
	</script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
		integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous">
	</script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>

	<script>
		document.getElementById('cerca').addEventListener('click', () => {
			if(document.getElementById('pages').value == '') return alert('Devi Inserire un valora Valido!');
			console.log(document.getElementById('pages').value);
			getPage(document.getElementById('pages').value);
			document.getElementById('pages').placeholder = document.getElementById('pages').value;
			document.getElementById('pages').value = '';
		})

		socket = io();

		function getPage(page) {
			socket.emit('get', page);
			socket.on('set', (result) => {
				document.getElementById('result').innerHTML = '<h3>' + result;
			});
		}
	</script>
</body>

</html>`



function html(file) {
	return fs.readFileSync(`./public/${file}.html`);
}

function findPage(n_page, html) {
	let start = html.indexOf(`<span class="mw-headline" id="Pag._${n_page}">`);
	let end;
	if (['13', '21', '31', '39', '47', '57', '65', '73'].includes(n_page))
		end = html.indexOf(`<span class="mw-headline" id="Unit`, start + 1);
	else if (n_page == 83)
		end = html.indexOf(`<span class="mw-headline" id="Workbook"`, start + 1);
	else if (n_page == 194)
		end = html.indexOf(`</div`, start + 1);
	else
		end = html.indexOf(`<span class="mw-headline" id="Pag.`, start + 1);
	if (html.slice(start, end) == '') return 'Nessun Esercizio Trovato</h3>';
	return html.slice(start, end);
}

app.use(express.static(__dirname + "/../public"));
app.use(function (req, res) {
	let args = req.url.split('/');
	let page = args[args.length - 1];
	console.log(page)
	switch (page) {
		case 'b1':
			res.writeHeader(200, {
				"Content-Type": "text/html"
			});
			res.write(html('b1'));
			res.end();
			break;

		case 'a2':
			res.writeHeader(200, {
				"Content-Type": "text/html"
			});
			res.write(html('a2'));
			res.end();
			break;

		case '404':
			res.writeHeader(404, {
				"Content-Type": "text/html"
			});
			res.write(html('404'));
			res.end();
			break;

		default:
			res.redirect('/404');
			break;
	}
});

server.listen(port, () => {
	console.log('SERVER running on port: ', port);
});

io.on('connection', (socket) => {
	socket.on('verificationb1', (user) => {
		let users = JSON.parse(fs.readFileSync('./server/users.json', 'utf-8'));
		console.log(user.username)
		console.log(user.password)
		console.log(users[user.username])
		if (users[user.username] && users[user.username].password == user.password) {
			socket.emit('ok', html_b1);
		} else socket.emit('fail');
	})


	socket.on('get', async (num) => {
		let html = (await (await fetch('https://solu.zone/wiki/Language_for_life_B1')).text());

		socket.emit('set', findPage(num, html));
	})
});