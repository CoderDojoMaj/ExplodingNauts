document.querySelector("#username").innerText = getCookie("EXPLODINGNAUTS_USER");

document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
document.querySelector(".stackHandInfo.correct").style.visibility = "hidden";

document.querySelector("#hand").onwheel = scrollableElement;
document.querySelector("#defused_cards").onwheel = scrollableElement;
document.querySelector("#putMultiple").onclick = pushToStack;

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
	console.log(droppedCard)
	if(droppedCard != "NotInTurn"){
		if(cardTypes.indexOf(droppedCard) != -1){
			ws.send(`ADD_CARDS\0["${droppedCard}"]`);
		}

		document.querySelector("#draggedCard").remove();
		reloadScrollbar("hand");
	}else{
		alert("No es tu turno.")
	}
	
	document.querySelector(".discardPile").classList.remove("highlight");
};

document.querySelector(".deck").onclick = (e) => {
	if (document.querySelector(".deck").disabled) {
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

	hand.splice(getHandCardIndex("ExplodingKitten"),1);
	hand.splice(getHandCardIndex("Defuse"),1);
	reloadScrollbar("hand")
	ws.send(`ADD_CARDS\0["Defuse"]`);
};