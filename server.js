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

let connections = {}
let deck=[];
let turn=0;
let turnOrder=0;
let startTimer=30;
let timerStarted=false;

websocketServer.on('connection', ws => {
    let user;
    ws.on('message', message => {
        let sMessage = message.match(/(.+?)\0(.+)/)
        console.log(sMessage, message)
        let data = sMessage[2]
        switch(sMessage[1].toUpperCase()){
            case 'HANDSHAKE':
                ws.send(`USER_LIST\0${JSON.stringify(Object.keys(connections))}`)
                for(let connection of Object.values(connections)) {
                    connection.send(`NEW_USER\0${data}`)
                }
                connections[data] = ws
                user = data;
                generateDeck(Date.now());
                deck[0]=4;
                timerStarted=true;
                break;
            case 'ADD_CARDS':
                for(let username in connections) {
                    connections[username].send(`ADD_CARDS\0${data}`)
                }
                break;
            case 'DRAW_CARD':
                connections[user].send(`DRAW_CARD\0${deck[turn]}`)
                turn++;
                break;
            case 'REQ_SEETHEFUTURE':
                let list=[];
                for(let i=turn;i<turn+parseInt(data);i++){
                    list.push(deck[i])
                }
                connections[user].send(`ANS_SEETHEFUTURE\0${JSON.stringify(list)}`)
                break;
        }
    });
    ws.on('close', ()=>{
        if(user){
            delete connections[user];
            for(let connection of Object.values(connections)) {
                connection.send(`USER_DISCONNECTED\0${user}`)
            }
        }
    });

    // let timer=setInterval(() => {
    //     if(timerStarted && startTimer>0){
    //         startTimer-=1;
    //         connections[user].send(`STARTING_TIME\0${Math.floor(startTimer)}`)
    //     }
    //     if(startTimer<=0){
    //         clearInterval(this);
    //     }
    // },1000)
});

function generateDeck(seed){
    Math.seed=seed;
    for(let c=0;c<Math.seededRandom(30,45);c++){
        deck.push(Math.floor(Math.seededRandom(-1,12)));
    }
}

server.listen(8080, function () {
    console.log('listening on *:' + 8080);
});


/*let server = app.listen(8080, function () {
    console.log('listening on *:' + 8080);
});*/

Math.seededRandom = function(max, min) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
}