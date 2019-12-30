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
let discardPile = [];
let turn = 0;
let attackAmount = 0;
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
    cattermelon: 12,
    targetedAttack: 13
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
                    acceptConnections = true
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
                let cards = JSON.parse(data);
                if(cards[0] == "SeeTheFuture" && cards.length == 1){
                    let list = [];
                    for (let i = 0; i < 3; i++) {
                        list.push(deck[i])
                    }
                    connections[user].send(`ANS_SEETHEFUTURE\0${JSON.stringify(list)}`)
                }else if(cards[0] == "TargetedAttack" && cards.length == 1){
                    ws.send(`ANS_TARGETED_ATTACK\0 `)
                }else if(cards[0] == "Attack" && cards.length == 1){
                    if(attackAmount > 0){
                        attackAmount+=2;
                    }else{
                        attackAmount+=1;
                    }
                    passTurn();
                }else if(cards[0] == "Skip" && cards.length == 1){
                    if(attackAmount==0){
                        passTurn();
                    }else{
                        attackAmount--;
                    }
                }else if(cards[0] == "Favor" && cards.length == 1){
                    connections[user].send("ANS_FAVOR\0 ")
                }else if(cards[0] == cards[1] && cards.length == 2 && cards[0].indexOf("Cat") != -1){
                    connections[user].send("COMBO\0C2Cat")
                }else if(cards[0] == cards[1] && cards[1] == cards[2] && cards.length == 3 && cards[0].indexOf("Cat") != -1){
                    connections[user].send("COMBO\0C3Cat")
                }else if([...new Set(cards)].length == 5 && cards.length == 5){
                    connections[user].send(`DISCARD_PILE\0${JSON.stringify(discardPile)}`)
                    connections[user].send("COMBO\0C5Cards")
                }
                discardPile = discardPile.concat(cards)
                for (let username in connections) {
                    connections[username].send(`ADD_CARDS\0${data}`)
                }
                break;
            case 'DRAW_CARD':
                if (acceptConnections) acceptConnections = false;
                connections[user].send(`DRAW_CARD\0${deck.shift()}`)
                if(attackAmount==0){
                    passTurn();
                }else{
                    attackAmount--;
                }
                break;
            case "GET_DECK":
                connections[user].send(`ACTUAL_DECK\0${JSON.stringify(deck)}`)
                break;
            case "SET_DECK":
                deck=JSON.parse(data);
                break;
            case "GET_HAND":
                let dataList = JSON.parse(data);
                let playerconn = connections[dataList[0]];
                let reason = dataList[1];
                playerconn.send(`HAND_REQUEST\0["${user}","${reason}"]`)
                break;
            case "ANS_HAND_REQUEST":
                let ansDataList = JSON.parse(data);
                let ansplayerconn = connections[ansDataList[0]];
                let ansreason = ansDataList[1];
                let hand = JSON.stringify(ansDataList[2]);
                ansplayerconn.send(`ANS_HAND_REQUEST\0[${hand},"${ansreason}"]`)
                break;
            case "STEAL_CARD":
                let stealDataList = JSON.parse(data);
                let cardIndex = stealDataList[1];
                let cardType = stealDataList[2];
                if(stealDataList[0] == "discardPile"){
                    discardPile.splice(cardIndex,1)
                    connections[user].send(`CARD_GOTTEN\0${cardType}`);
                }else{
                    let stealPlayerconn = connections[stealDataList[0]];
                    if(cardIndex != -1){
                        stealPlayerconn.send(`CARD_STOLEN\0${cardIndex}`)
                        connections[user].send(`CARD_GOTTEN\0${cardType}`);
                    }else{
                        stealPlayerconn.send(`CARD_STOLEN_IF_EXISTS\0["${cardType}","${user}"]`)
                    }
                }
                break;
            case "STOLE_SUCCESFULLY":
                let stolenDataList = JSON.parse(data);
                let stolenPlayerconn = connections[stolenDataList[1]];
                let stolencardType = stolenDataList[0];
                stolenPlayerconn.send(`CARD_GOTTEN\0${stolencardType}`);
                break;
            case "SET_DISCARD_PILE":
                discardPile=JSON.parse(data);
                break;
            case "SKIP_TO":
                let playerNames = Object.keys(players);
                turn = Object.keys(connections).indexOf(data);
                for(let player of Object.values(players)){
                    if(players[playerNames[turn%Object.values(players).length]] == player){
                        player.send(`ACTIVATE\0 `)
                    }else{
                        player.send(`DEACTIVATE\0 `)
                    }
                }
                break;
            case "ATTACK_CURRENT":
                if(attackAmount > 0){
                    attackAmount+=2;
                }else{
                    attackAmount+=1;
                }
                break;
            case "SKIP":
                if(attackAmount==0){
                    passTurn();
                }else{
                    attackAmount--;
                }
                break;
            case "ASK_FAVOR":
                let askedPlayer = connections[data];
                askedPlayer.send(`FAVOR_ASKED\0${user}`)
                break;
            case "SEND_FAVOR":
                let favorDataList = JSON.parse(data);
                let favorPlayerconn = connections[favorDataList[0]];
                let favorcardType = favorDataList[1];
                favorPlayerconn.send(`CARD_GOTTEN\0${favorcardType}`);
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
    for (let i = 0; i < 4; i++) {
        cards.push(cardIds.targetedAttack)
    }
    
    // Shuffle deck
    let numberOfCards = cards.length;
    for (let c = 0; c < numberOfCards; c++) {
        let index=Math.floor(Math.random()*cards.length);
        deck.push(cards[index])
        cards.splice(index,1)
    }
}

function passTurn(){
    turn+=turnOrder;
    let tmpturn = turn;
    let playerNames = Object.keys(players);
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
}

server.listen(8080, function () {
    console.log('listening on *:' + 8080);
});