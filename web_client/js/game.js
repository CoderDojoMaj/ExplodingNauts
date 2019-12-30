document.querySelector("#username").innerText = getCookie("EXPLODINGNAUTS_USER");

document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
document.querySelector(".stackHandInfo.correct").style.visibility = "hidden";

document.querySelector("#putMultiple").onclick = (e) => {
	let canPush = getStackHandInfo();
	if(canPush){
		pushToStack();
	}else{
		pushToHand();
	}
}

document.querySelector(".stackHand").ondragover = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    document.querySelector(".stackHand").classList.add("highlight");
};

document.querySelector(".stackHand").ondragleave = (e) => {
    e.preventDefault();
    document.querySelector(".stackHand").classList.remove("highlight");
};

document.querySelector(".stackHand").ondrop = (e) => {
    e.preventDefault();
	var droppedCard = e.dataTransfer.getData("application/coder-card");
	if(cardTypes.indexOf(droppedCard) != -1){
		let card = createCard(droppedCard);
		cardsInStackHand.push(card);
		getStackHandInfo();
		card.classList.remove("template");
		card.classList.remove("hidden");
		card.style.transform = "rotate("+(Math.random()-0.5)*45+"deg)";
		document.querySelector(".stackHand").appendChild(card);

		hand.splice(getHandCardIndex(document.querySelector("#draggedCard").classList[0]),1);
		document.querySelector("#draggedCard").remove();
		reloadScrollbar("hand");
	}else if(droppedCard == "NotInTurn"){
		alert("No es tu turno.")
	}

	document.querySelector(".stackHand").classList.remove("highlight");
};

document.querySelector("#hand").onwheel = scrollableElement;
document.querySelector("#defused_cards").onwheel = scrollableElement;
document.querySelector("#twocat_cards").onwheel = scrollableElement;
document.querySelector("#threecat_cards").onwheel = scrollableElement;
document.querySelector("#fivecat_cards").onwheel = scrollableElement;
document.querySelector("#favor_cards").onwheel = scrollableElement;

document.querySelector(".discardPile").ondragover = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    document.querySelector(".discardPile").classList.add("highlight");
};

document.querySelector(".discardPile").ondragleave = (e) => {
    e.preventDefault();
    document.querySelector(".discardPile").classList.remove("highlight");
};

document.querySelector(".discardPile").ondrop = (e) => {
    e.preventDefault();
	var droppedCard = e.dataTransfer.getData("application/coder-card");
	if(cardTypes.indexOf(droppedCard) != -1){
		if(cardTypes.indexOf(droppedCard) != -1){
			ws.send(`ADD_CARDS\0["${droppedCard}"]`);
		}

		hand.splice(getHandCardIndex(document.querySelector("#draggedCard").classList[0]),1);
		document.querySelector("#draggedCard").remove();
		reloadScrollbar("hand");
	}else if(droppedCard == "NotInTurn"){
		alert("No es tu turno.")
	}

	document.querySelector(".discardPile").classList.remove("highlight");
};

document.querySelector(".deck").onclick = (e) => {
	if (document.querySelector(".deck").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	ws.send("DRAW_CARD\0 ");
};

document.querySelector("#stf_ok").onclick = (e) => {
	if (document.querySelector("#stf_ok").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	removeClassFromAll(document.querySelector("body"), "darken", true, "stf");
	document.getElementById("stf_modal").classList.add("hidden")
};

document.querySelector("#defused_ok").onclick = (e) => {
	if (document.querySelector("#defused_ok").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	removeClassFromAll(document.querySelector("body"), "darken", true, "defused");
	document.getElementById("defused_modal").classList.add("hidden")
	document.getElementById("defused_cards").innerHTML = '';
	document.getElementById("defused_cards").appendChild(ek_position_defused);
	document.getElementById("defused_cards").onmousemove = () => {}
	localDeck.splice(ek_index,0,0)
	ws.send(`SET_DECK\0${JSON.stringify(localDeck)}`);

	document.querySelector(".hand").children[getHandCardIndex("ExplodingKitten")].remove();
	hand.splice(getHandCardIndex("ExplodingKitten"),1);
	document.querySelector(".hand").children[getHandCardIndex("Defuse")].remove();
	hand.splice(getHandCardIndex("Defuse"),1);
	reloadScrollbar("hand")
	ws.send(`ADD_CARDS\0["Defuse"]`);
	// Deactivate player
	disableCardsInHand(["Nope"]);
	document.querySelector(".deck").setAttribute("disabled", true)
	document.querySelector("#putMultiple").setAttribute("disabled", true)
};

document.getElementById("people").onclick = openPeopleModal;

document.getElementById("people_ok").onclick = closePeopleModal;

document.querySelector("#twocat_ok").onclick = (e) => {
	if (document.querySelector("#twocat_ok").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	let cardIndex = getChildIndex(document.getElementById("twocat_cards"),document.querySelector(".Back.selected"));	
	let cardType = document.querySelector(".Back.selected").originalCard;
	ws.send(`STEAL_CARD\0["${selectedPlayer}",${cardIndex},"${cardType}"]`);
	removeClassFromAll(document.querySelector("body"), "darken", true, "twocat");
	document.getElementById("twocat_modal").classList.add("hidden")
	document.getElementById("twocat_cards").innerHTML = '';
};

document.querySelector("#threecat_ok").onclick = (e) => {
	if (document.querySelector("#threecat_ok").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	let cardIndex = -1;
	let cardType = document.querySelector("card.selected").classList[0];
	ws.send(`STEAL_CARD\0["${selectedPlayer}",${cardIndex},"${cardType}"]`);
	removeClassFromAll(document.querySelector("body"), "darken", true, "threecat");
	document.getElementById("threecat_modal").classList.add("hidden")
	document.getElementById("threecat_cards").innerHTML = '';
};

document.querySelector("#fivecat_ok").onclick = (e) => {
	if (document.querySelector("#fivecat_ok").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	let cardIndex = -1;
	let cardType = document.querySelector("card.selected").classList[0];
	ws.send(`STEAL_CARD\0["discardPile",${cardIndex},"${cardType}"]`);
	removeClassFromAll(document.querySelector("body"), "darken", true, "fivecat");
	document.getElementById("fivecat_modal").classList.add("hidden")
	document.getElementById("fivecat_cards").innerHTML = '';
};

document.querySelector("#favor_ok").onclick = (e) => {
	if (document.querySelector("#favor_ok").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	let cardType = document.querySelector("card.selected").classList[0];
	let playerToSend = document.querySelector("#favor_ok").player;
	
	let cardindex = getHandCardIndex(cardType);
	if(cardindex != -1){
		hand.splice(cardindex,1)
		document.querySelector(".hand").children[cardindex].remove();

		ws.send(`SEND_FAVOR\0["${playerToSend}","${cardType}"]`);
	}
	removeClassFromAll(document.querySelector("body"), "darken", true, "favor");
	document.getElementById("favor_modal").classList.add("hidden")
	document.getElementById("favor_cards").innerHTML = '';
};