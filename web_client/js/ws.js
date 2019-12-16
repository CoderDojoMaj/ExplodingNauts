let url = 'ws://' + document.location.host
var ws = new WebSocket(url)

//Possible Message Names/Types => addCard, drawCard, explodePlayer (?)...
ws.onmessage = (data) => {
	let message = data.data
	let sMessage = message.match(/(.+?)\0(.+)/)
	// console.log(sMessage, message)
	let messageData = sMessage[2]
	switch (sMessage[1].toUpperCase()) {
		case 'ADD_CARDS':
			let arr = JSON.parse(messageData);
			console.log(arr)
			let cardArr = []
			for (let className of arr) {
				var addedCard = createCard(className);
				addedCard.classList.remove("template");
				addedCard.classList.remove("hidden");
				addedCard.style.transform = "rotate("+(Math.random()-0.5)*45+"deg)";
				document.querySelector(".discardPile").appendChild(addedCard);
			}
			cardsInStack = cardsInStack.concat(cardArr)
			break;
		case 'USER_LIST':
			playerList=JSON.parse(messageData)
			populatePeopleModal();
			break;
		case 'NEW_USER':
			if(playerList.indexOf(messageData) == -1)
				playerList.push(messageData)
			populatePeopleModal();
			break;
		case 'USER_DISCONNECTED':
			if(playerList.indexOf(messageData) != -1)
				playerList.splice(playerList.indexOf(messageData),1)
			populatePeopleModal();
			break;
		case "DRAW_CARD":
			let card = createCard(cardTypes[parseInt(messageData)]);
			card.classList.remove("template");
			card.classList.remove("hidden");
			card.classList.add("relative");
			card.draggable = true;
			document.getSelection().empty();
			card.ondragstart = (e) => {
				e.dataTransfer.setData("application/coder-card", e.target.classList[0]);
				if(document.querySelector("#draggedCard"))
					document.querySelector("#draggedCard").id = "";
				e.target.id = "draggedCard";
				e.dataTransfer.dropEffect = "move";
			};

			card.ondragend = (e) => {
				if(document.querySelector("#draggedCard"))
					document.querySelector("#draggedCard").id = "";
			};
			document.querySelector(".hand").appendChild(card);
			reloadScrollbar("hand");

			if (card.classList.contains("ExplodingKitten") && handContainsCard("Defuse")) {
				ws.send("GET_DECK\0 ");
				setTimeout(showDefuseModal, 100);
			}
			break;
		case "ANS_SEETHEFUTURE":
			let answer = JSON.parse(messageData);
			let cardList = [];
			//Modify class adding/substracting if there's a better way
			addClassToAll(document.querySelector("body"), "darken", true, true, "stf");
			let cardNum = 1;
			for (let card of answer) {
				try {
					let actual = getCardById(parseInt(card))
					actual.classList.add("fake");
					actual.id = `stf_card${cardNum}`
					cardList.push(actual);
					cardNum++;
				} catch (e) {
					break;
				}
			}
			document.getElementById("stf_card1").outerHTML = cardList[0] == undefined ? `<card id="stf_card1" class="hidden"></card>` : cardList[0].outerHTML;
			document.getElementById("stf_card2").outerHTML = cardList[1] == undefined ? `<card id="stf_card2" class="hidden"></card>` : cardList[1].outerHTML;
			document.getElementById("stf_card3").outerHTML = cardList[2] == undefined ? `<card id="stf_card3" class="hidden"></card>` : cardList[2].outerHTML;
			document.getElementById("stf_modal").classList.remove("hidden");
			break;
		case "ACTUAL_DECK":
			localDeck = JSON.parse(messageData);
			break;
		case 'ACTIVATE':
			enableHand();
			document.querySelector(".deck").disabled = false;
			break;
		case 'DEACTIVATE':
			disableCardsInHand(["Nope"]);
			document.querySelector(".deck").disabled = true;
			break;
		case 'SPECTATE':
			addClassToAll(document.querySelector("body"), "darken", true, true, "");
			removeClassFromAll(document.querySelector("body"), "darken", false, "");
			if(spectatorList.indexOf(messageData) == -1)
				spectatorList.push(messageData)
			populatePeopleModal()
			break;
	}
}

ws.onopen = () => {
	ws.send(`HANDSHAKE\0${getCookie('EXPLODINGNAUTS_USER')}`)
}