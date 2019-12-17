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

let websocketServer = new ws.Server({ server });

let connections = {}
let players = {}
let spectators = {}
let deck = [];
let turn = 0;
let turnOrder = 1;
let cardIds = {
    explodingKitten: 0,
    attack: 1,
    defuse: 2,
    nope: 3,
    seeTheFuture: 4,
    skip: 5,
    favor: 6,
    shuffle: 7,
    rainbowCat: 8,
    hairyPotatoCat: 9,
    tacoCat: 10,
    beardCat: 11,
    cattermelon: 12
};
let acceptConnections = true;

websocketServer.on('connection', ws => {
    let user;
    ws.on('message', message => {
        let sMessage = message.match(/(.+?)\0(.+)/)
        console.log(sMessage, message)
        let data = sMessage[2]
        switch (sMessage[1].toUpperCase()) {
            case 'HANDSHAKE':
                if (Object.keys(connections).length == 0) {
                    deck=[];
                    generateDeck();
                    acceptConnections = true;
                }

                user = data;

                connections[user] = ws
                ws.send(`USER_LIST\0${JSON.stringify(Object.keys(connections))}`)
                if(acceptConnections){
                    players[user] = connections[user];
                    for (let connection of Object.values(connections)) {
                        if(connection != ws)
                            connection.send(`NEW_USER\0${data}`)
                    }
                    
                    connections[user].send(`DRAW_CARD\0${cardIds.defuse}`)
                    if(Object.values(connections).length > 1){
                        connections[user].send(`DEACTIVATE\0 `)
                    }
                }else{
                    connections[user].send(`SPECTATE\0 `)
                    spectators[user] = connections[user];
                }
                console.log("PLAYERS:",Object.keys(players))
                console.log("SPECTATORS:",Object.keys(spectators))
                break;
            case 'ADD_CARDS':
                if(acceptConnections) acceptConnections = false;
                for (let username in connections) {
                    connections[username].send(`ADD_CARDS\0${data}`)
                }
                if(data.indexOf("SeeTheFuture")!=-1){
                    let list = [];
                    for (let i = 0; i < 3; i++) {
                        list.push(deck[i])
                    }
                    connections[user].send(`ANS_SEETHEFUTURE\0${JSON.stringify(list)}`)
                }
                break;
            case 'DRAW_CARD':
                if (acceptConnections) acceptConnections = false;
                connections[user].send(`DRAW_CARD\0${deck.shift()}`)
                turn+=turnOrder;
                let tmpturn = turn;
                playerNames = Object.keys(players);
                if (turn<0){
                    tmpturn = playerNames.length+turn;
                }
                console.log(turn,playerNames,"TURN TO:",playerNames[tmpturn%Object.values(players).length])
                for(let player of Object.values(players)){
                    if(players[playerNames[tmpturn%Object.values(players).length]] == player){
                        player.send(`ACTIVATE\0 `)
                    }else{
                        player.send(`DEACTIVATE\0 `)
                    }
                }
                break;
            case "GET_DECK":
                connections[user].send(`ACTUAL_DECK\0${JSON.stringify(deck)}`)
                break;
            case "SET_DECK":
                deck=JSON.parse(data);
                break;
        }
    });
    ws.on('close', () => {
        if (user) {
            delete connections[user];
            delete players[user];
            delete spectators[user];
            for (let connection of Object.values(connections)) {
                connection.send(`USER_DISCONNECTED\0${user}`)
            }
        }
    });
});

//["ExplodingKitten", "Attack", "Defuse", "Nope", "SeeTheFuture", "Skip", "Favor", "Shuffle", "RainbowCat", "HairyPotatoCat", "TacoCat", "BeardCat", "Cattermelon"]
function generateDeck(players = 5) {
    let cards = []
    
    for (let i = 0; i < players - 1; i++) {
        cards.push(cardIds.explodingKitten)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.attack)
    }
    for (let i = 0; i < Math.max(1 + players, 6 - players); i++) {
        cards.push(cardIds.defuse)
    }
    for (let i = 0; i < 5; i++) {
        cards.push(cardIds.nope)
    }
    for (let i = 0; i < 5; i++) {
        cards.push(cardIds.seeTheFuture)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.skip)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.favor)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.shuffle)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.rainbowCat)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.hairyPotatoCat)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.tacoCat)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.beardCat)
    }
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.cattermelon)
    }
    
    // Shuffle deck
    let numberOfCards = cards.length;
    for (let c = 0; c < numberOfCards; c++) {
        let index=Math.floor(Math.random()*cards.length);
        deck.push(cards[index])
        cards.splice(index,1)
    }
}

server.listen(8080, function () {
    console.log('listening on *:' + 8080);
});