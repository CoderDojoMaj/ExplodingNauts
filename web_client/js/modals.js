function closePeopleModal(){
	document.getElementById("people_modal").classList.add("hidden");
	removeClassFromAll(document.querySelector("body"), "darken", true, "people");
}

function openPeopleModal(){
	addClassToAll(document.querySelector("body"), "darken", true, true, "people");
	document.getElementById("people_modal").classList.remove("hidden");
}

function showDefuseModal() {
	document.getElementById("defused_cards").scrollPos=0;
	addClassToAll(document.querySelector("body"), "darken", true, true, "defused");
	for (let cardId of localDeck) {
		let backCard = document.querySelector(".Back.template").cloneNode(true);
		backCard.classList.remove("hidden");
		backCard.classList.remove("template");
		backCard.classList.add("relative");
		document.getElementById("defused_cards").appendChild(backCard);
	}
	document.getElementById("defused_modal").classList.remove("hidden");
	let defusedCardPos=document.getElementById("defused_cards").getBoundingClientRect();
	calcElementWidth(document.getElementById("defused_cards"), document.getElementById("defused_scroll"));
	document.getElementById("defused_scroll").style.top=`-${window.innerHeight-defusedCardPos.height+15}px`;
	document.getElementById("defused_cards").onmousemove = (e) => {
		// document.getElementById("ek_position_defused")
		let pos = Math.min(Math.round((e.x-document.getElementById("defused_cards").scrollPos) / 176), localDeck.length) * 176;	// Add scroll pos
		ek_position_defused.style.left = `${pos - ek_position_defused .getBoundingClientRect().width / 2}px`
	}
}

document.getElementById("people").onclick = openPeopleModal

document.getElementById("people_modal").onclick = closePeopleModal