//WebSocket Stuff

//Game Stuff


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
};
