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
	refreshScroll(document.getElementById("defused_cards"));
	addClassToAll(document.querySelector("body"), "darken", true, true, "defused");
	document.getElementById("defused_ok").setAttribute("disabled", true)
	for (let cardId of localDeck) {
		let backCard = document.querySelector(".Back.template").cloneNode(true);
		backCard.classList.remove("hidden");
		backCard.classList.remove("template");
		backCard.classList.add("relative");
		backCard.innerText="\0"; // So that the exploding kitten appears aligned.
		document.getElementById("defused_cards").appendChild(backCard);
	}
	document.getElementById("defused_modal").classList.remove("hidden");
	let defusedCardPos=document.getElementById("defused_cards").getBoundingClientRect();
	calcElementWidth(document.getElementById("defused_cards"), document.getElementById("defused_scroll"));
	document.getElementById("defused_scroll").style.top=`-${window.innerHeight-defusedCardPos.height+15}px`;
	document.getElementById("defused_cards").onmousemove = (e) => {
		let pos = Math.min(Math.round((e.x-document.getElementById("defused_cards").scrollPos) / 176), localDeck.length) * 176;	// Add scroll pos
		ek_position_defused.style.left = `${pos - ek_position_defused.getBoundingClientRect().width / 2}px`
	}
	document.getElementById("defused_cards").onclick = (e) => {
		document.getElementById("defused_ok").removeAttribute("disabled")
		let index = Math.min(Math.round((e.x-document.getElementById("defused_cards").scrollPos) / 176), localDeck.length);	// Add scroll pos
		let exploding_kitten=document.querySelector(".ExplodingKitten.template").cloneNode(true);
		exploding_kitten.classList.remove("template");
		exploding_kitten.classList.remove("hidden");
		exploding_kitten.classList.add("relative");
		for(let child of document.getElementById("defused_cards").children){
			if(child.classList.contains("ExplodingKitten"))
				document.getElementById("defused_cards").removeChild(child)
		}
		document.getElementById("defused_cards").insertBefore(exploding_kitten,document.getElementById("defused_cards").children[index+1]);
		ek_index=index;
	}
}

document.getElementById("people").onclick = openPeopleModal

document.getElementById("people_ok").onclick = closePeopleModal