const express = require('express');
const fs = require('fs')
const ws = require('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

const web_client_path = __dirname + '/web_client/';
const html_path = web_client_path + 'html/';
const js_path = web_client_path + 'js/';
const css_path = web_client_path + 'css/';
const js_lib_path = js_path + 'lib/';
const img_path = web_client_path + 'images/';

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // for parsing cookies

app.get('/js/:file', async function (req, res) {
    try {
        const file = js_path + req.params.file
        const exists = fs.existsSync(file)
        if (exists) res.sendFile(file);
        else res.sendStatus(404);

    } catch (err) {
        console.error('ERROR:', err);
        res.sendStatus(500); // Internal Server Error
    };
});

app.get('/js/lib/:file', async function (req, res) {
    try {
        const file = js_lib_path + req.params.file
        const exists = fs.existsSync(file)
        if (exists) res.sendFile(file);
        else res.sendStatus(404);

    } catch (err) {
        console.error('ERROR:', err);
        res.sendStatus(500); // Internal Server Error
    };
});

app.get('/images/:file', async function (req, res) {
    try {
        const file = img_path + req.params.file
        const exists = fs.existsSync(file)
        if (exists) res.sendFile(file);
        else res.sendStatus(404);

    } catch (err) {
        console.error('ERROR:', err);
        res.sendStatus(500); // Internal Server Error
    };
});

app.get('/css/:file', async function (req, res) {
    try {
        const file = css_path + req.params.file
        const exists = fs.existsSync(file)
        if (exists) res.sendFile(file);
        else res.sendStatus(404);

    } catch (err) {
        console.error('ERROR:', err);
        res.sendStatus(500); // Internal Server Error
    };
});

app.get('/', async function (req, res) {
    res.sendFile(html_path + 'index.html');
});

app.post('/play', async function (req, res) {
    //console.log(req.body.user);
    res.cookie('EXPLODINGNAUTS_USER', req.body.user);
    res.redirect('/game')
});

app.get('/game', async function (req, res) {
    res.sendFile(html_path + 'game.html');
});

let server = require('http').createServer(app);

let websocketServer = new ws.Server({server});

websocketServer.on('connection', ws => {
    ws.on('message', message => {
        console.log(message)
        ws.send(message.charAt(0))
    });
});


server.listen(8080, function () {
    console.log('listening on *:' + 8080);
});


/*let server = app.listen(8080, function () {
    console.log('listening on *:' + 8080);
});*/