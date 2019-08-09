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
				let card = document.querySelector("." + className + ".template").cloneNode(true);
				card.classList.remove("hidden")
				card.classList.remove("template");
				card.style.transform += "rotate(" + (Math.random() - 0.5) * 20 + "deg)";
				cardArr.push(card);
			}
			cardsInStack = cardsInStack.concat(cardArr)
			redrawStack()
			break;
		// case 'STARTING_TIME':
		// 	document.getElementById("timer").innerText=messageData;
		// 	break;
		case "DRAW_CARD":
			let card = document.querySelector("." + cardTypes[parseInt(messageData)] + ".template").cloneNode(true);
			card.classList.remove("hidden");
			card.classList.remove("template");
			card.classList.add("relative");
			hand.unshift(card);
			reloadHand();
			dragElement(card)

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
	}
}

ws.onopen = () => {
	ws.send(`HANDSHAKE\0${getCookie('EXPLODINGNAUTS_USER')}`)
}