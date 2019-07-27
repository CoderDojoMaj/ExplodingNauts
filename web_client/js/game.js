document.querySelector("#username").innerText = getCookie("EXPLODINGNAUTS_USER");

for (let el of document.querySelectorAll("card:not(.fake):not(.hidden)")) {
	dragElement(el);
}

document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
document.querySelector(".stackHandInfo.correct").style.visibility = "hidden";

document.querySelector("#hand").onwheel = scrollableElement;
document.querySelector("#defused_cards").onwheel = scrollableElement;
document.querySelector("#putMultiple").onclick = pushToStack;
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

	let exploding_kitten=document.querySelector(".ExplodingKitten.template").cloneNode(true);
	exploding_kitten.classList.remove("template");
	exploding_kitten.classList.remove("hidden");
	exploding_kitten.classList.add("relative");

	let defuse=document.querySelector(".Defuse.template").cloneNode(true);
	defuse.classList.remove("template");
	defuse.classList.remove("hidden");
	defuse.classList.add("relative");

	hand.splice(hand.indexOf(exploding_kitten),1);
	hand.splice(hand.indexOf(defuse),1);
	reloadHand();
	ws.send(`ADD_CARDS\0["Defuse"]`);
	redrawStack();
};