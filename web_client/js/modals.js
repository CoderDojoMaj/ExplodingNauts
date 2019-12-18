function closePeopleModal(){
	selectedPlayer = document.querySelector("li.selected").innerText;
	if(peopleModalReason == "C2Cat"){
		ws.send(`GET_HAND\0["${selectedPlayer}","C2Cat"]`)
	}else if(peopleModalReason == "C3Cat"){
		ws.send(`GET_HAND\0["${selectedPlayer}","C3Cat"]`)
	}else if(peopleModalReason == "Favor"){
		//TODO: Make favor work
	}

	if(document.querySelector("li.selected"))
		document.querySelector("li.selected").classList.remove("selected");

	document.getElementById("people_modal").classList.add("hidden");
	removeClassFromAll(document.querySelector("body"), "darken", true, "people");
}

function openPeopleModal(reason){
	if(reason == "C2Cat" || reason == "C3Cat" || reason == "Favor"){
		document.querySelector("#people_title").innerText = "Choose a Player";
		document.querySelector("#people_ok").setAttribute("disabled", true)
	}else{
		document.querySelector("#people_title").innerText = "Players";
		document.querySelector("#people_ok").removeAttribute("disabled")
	}
	peopleModalReason = reason;

	addClassToAll(document.querySelector("body"), "darken", true, true, "people");
	document.getElementById("people_modal").classList.remove("hidden");
}

function showDefuseModal() {
	document.getElementById("defused_cards").scrollPos=0;
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
	reloadScrollbar("defused_cards");
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

function twoCatModal(hand){
	document.getElementById("twocat_cards").scrollPos=0;
	addClassToAll(document.querySelector("body"), "darken", true, true, "twocat");
	document.getElementById("twocat_ok").setAttribute("disabled", true)
	for (let cardClass of hand) {
		let backCard = document.querySelector(".Back.template").cloneNode(true);
		backCard.classList.remove("hidden");
		backCard.classList.remove("template");
		backCard.classList.add("relative");
		backCard.innerText="\0";
		backCard.onclick = (e) => {
			document.getElementById("twocat_ok").removeAttribute("disabled");
			if(document.querySelector("card.Back.selected"))
					document.querySelector("card.Back.selected").classList.remove("selected");
			e.target.classList.add("selected");
		}
		backCard.originalCard=cardClass
		document.getElementById("twocat_cards").appendChild(backCard);
	}
	document.getElementById("twocat_modal").classList.remove("hidden");
	let twocatCardPos=document.getElementById("twocat_cards").getBoundingClientRect();
	calcElementWidth(document.getElementById("twocat_cards"), document.getElementById("twocat_scroll"));
	document.getElementById("twocat_scroll").style.top=`-${window.innerHeight-twocatCardPos.height+15}px`;
	reloadScrollbar("twocat_cards");
}