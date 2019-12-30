function createCard(cardname) {
    let card = document.querySelector("card.template."+cardname).cloneNode();
    card.innerText = document.querySelector("card.template."+cardname).innerText;
    return card;
}

function reloadScrollbar(id) {
	let prefix = id.indexOf("_") == -1 ? id : id.substring(0, id.indexOf("_"));
    let elmnt = document.getElementById(id);
	let scrollbar = document.querySelector(`.scrollRect#${prefix}_scroll`);
	calcElementWidth(elmnt, scrollbar);
}

function getStackHandInfo() {
	let classList = [];
	let canPush = false;
	for (let card of cardsInStackHand) {
		classList.push(card.classList[0]);
	}
	if (classList.length == 0) { //No Cards in StackHand
		document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility = "hidden";
	} else if (classList[0] == classList[1] && classList.length == 2 && classList[0].indexOf("Cat") != -1) { //Same 2 cat cards
		document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility = "visible";
		canPush = true;
	} else if (classList[0] == classList[1] && classList[1] == classList[2] && classList.length == 3 && classList[0].indexOf("Cat") != -1) { //Same 3 cat cards
		document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility = "visible";
		canPush = true;
	} else if ([...new Set(classList)].length == 5 && classList.length == 5) { //5 different cards
		document.querySelector(".stackHandInfo.error").style.visibility = "hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility = "visible";
		canPush = true;
	} else { //No valid combination
		document.querySelector(".stackHandInfo.error").style.visibility = "visible";
		document.querySelector(".stackHandInfo.correct").style.visibility = "hidden";
	}
	return canPush;
}

function pushToStack() {
	if (document.querySelector("#putMultiple").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	let messageToSend = [];
	for (let card of cardsInStackHand) {
		messageToSend.push(card.classList[0]);
		document.querySelector(".stackHand").children[0].remove();
	}
	ws.send(`ADD_CARDS\0${JSON.stringify(messageToSend)}`);
	//cardsInStack=cardsInStack.concat(cardsInStackHand);
	cardsInStackHand = [];
	getStackHandInfo();
};

function pushToHand() {
	if (document.querySelector("#putMultiple").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	for (let card of cardsInStackHand) {
		document.querySelector(".stackHand").children[0].remove();
		card.style.transform = "";
		card.classList.add("relative");
		card.draggable = true;
		card.ondragstart = cardDragStart;
		document.querySelector(".hand").appendChild(card)
	}
	hand = hand.concat(cardsInStackHand);
	cardsInStackHand = [];
    reloadScrollbar("hand");
	getStackHandInfo();
};

function isOffscreen(elmnt) {
	if(!elmnt) return false;
	let pos = elmnt.getBoundingClientRect();
	return pos.x < 0 || pos.y < 0 || pos.x + pos.width > window.innerWidth || pos.y + pos.height > window.innerHeight;
}

function scrollableElement(e) {
	let elmnt = e.target.tagName == "DIV" ? e.target : e.target.parentElement;
	let elmntPrefix = elmnt.id.indexOf("_") == -1 ? elmnt.id : elmnt.id.substring(0, elmnt.id.indexOf("_"));
	let scrollbar = document.querySelector(`.scrollRect#${elmntPrefix}_scroll`);
	if (!elmnt.scrollPos) elmnt.scrollPos = 0
	if (isOffscreen(elmnt.lastChild)) {
		elmnt.scrollPos += e.deltaY / 2.5;
	} else if (e.deltaY > 0) {
		elmnt.scrollPos += e.deltaY / 2.5;
	}
	if (elmnt.scrollPos > 0) {
		elmnt.scrollPos = 0
	}
	elmnt.style.left = elmnt.scrollPos + "px";
	calcElementWidth(elmnt, scrollbar)
	scrollbar.style.left = Math.abs(elmnt.scrollPos) * window.innerWidth / elmnt.width + "px"
}

function calcElementWidth(elmnt, scrollbar) {
	elmnt.width = 0
	let last = elmnt.lastChild;
	for (let node of elmnt.children) {
		let pos = node.getBoundingClientRect();
		let style = window.getComputedStyle ? getComputedStyle(node) : node.currentStyle;
		elmnt.width += (pos.width + (parseInt(style.marginLeft || 0)) * 2);
	}
	//Make scroll bar visible/invisible and resize itself
	if (isOffscreen(last) || isOffscreen(elmnt.querySelector("card"))) {
		scrollbar.classList.remove('vis_hidden')
		scrollbar.style.width = window.innerWidth * 100 / elmnt.width + "vw"
	} else {
		scrollbar.classList.add('vis_hidden')
	}
}

function handContainsCard(cardClass) {
	for (let card of hand) {
		if (card.classList.contains(cardClass)) return true
	}
	return false
}

function getHandCardIndex(cardClass) {
	let index=0;
	for (let card of hand) {
		if (card.classList.contains(cardClass)) return index
		else index++;
	}
	return -1;
}

/**
 * addClassToAll
 * @param {*} parentElmnt The element to start the search from
 * @param {*} className The class to add to the matching elements
 * @param {*} disableClickables If this disables clickables
 * @param {*} disableDraggables If this disables draggables
 * @param {*} exceptId Elements with this Id/Prefix will not be added the class
 */
function addClassToAll(parentElmnt, className, disableClickables, disableDraggables, exceptId = "") {
	for (let node of parentElmnt.querySelectorAll(":scope > *:not(.template)")) { // Targets all direct children of parentElmnt
		if (node.id.indexOf(exceptId) == -1) {
			node.classList.add(className);
			if (node.onclick && disableClickables) node.setAttribute("disabled", true)
			if (node.isDraggable && disableDraggables) node.setAttribute("disabled", true)
			if (node.childElementCount > 0) addClassToAll(node, className, disableClickables, disableDraggables, exceptId);
		}
	}
}

/**
 * removeClassFromAll
 * @param {*} parentElmnt The element to start the search from.
 * @param {*} className The class to remove to the matching element
 * @param {*} enableDisabled Enable the disabled elements
 * @param {*} exceptId Elements with this Id/Prefix will not be removed the class
 */
function removeClassFromAll(parentElmnt, className, enableDisabled, exceptId = "") {
	for (let node of parentElmnt.querySelectorAll("*:not(.template)")) {
		if (node.id.indexOf(exceptId) == -1) {
			node.classList.remove(className);
			if (node.childElementCount > 0) removeClassFromAll(node, className, enableDisabled, exceptId);
		}
	}
	if (enableDisabled) enableAllDisabled();
}

function enableAllDisabled() {
	for (let node of document.querySelectorAll("*[disabled='true']")) {
		node.removeAttribute("disabled")
	}
}

function getCardById(id){
	let card = document.querySelector("." + cardTypes[id] + ".template").cloneNode(true);
	card.classList.remove("hidden");
	card.classList.remove("template");
	return card;
}

function populatePeopleModal(){
	document.getElementById("people_list").innerHTML = "";
	playerList.sort();
	for(let player of playerList){
		let playerLi = document.createElement("li");
		playerLi.innerText = player;
		playerLi.onclick = (e) => {
			if(peopleModalReason == "C2Cat" || peopleModalReason == "C3Cat" || peopleModalReason == "Favor" || peopleModalReason == "TargetedAttack"){
				if(document.querySelector("li.selected"))
					document.querySelector("li.selected").classList.remove("selected");
				e.target.classList.add("selected");
				document.querySelector("#people_ok").removeAttribute("disabled")
			}
		}
		document.getElementById("people_list").appendChild(playerLi);
	}
	for(let spectator of spectatorList){
		let spectatorLi = document.createElement("li");
		spectatorLi.innerText = spectator;
		spectatorLi.style.color = "#ccc";
		spectatorLi.style.fontStyle = "italic";
		spectatorLi.classList = "spectator";
		spectatorLi.onclick = (e) => {
			if(peopleModalReason == "C2Cat" || peopleModalReason == "C3Cat" || peopleModalReason == "Favor"){
				if(document.querySelector("li.selected"))
					document.querySelector("li.selected").classList.remove("selected");
				e.target.classList.add("selected");
			}
		}
		document.getElementById("people_list").appendChild(spectatorLi);
	}
}

function disableCardsInHand(exceptCards){
	for(let card of document.getElementById("hand").childNodes){
		if(exceptCards.indexOf(card.classList[0]) == -1){
			card.setAttribute("disabled", true)
		}
	}
}

function enableHand() {
	for(let card of document.getElementById("hand").childNodes){
		card.removeAttribute("disabled")
	}
}

function cardDragStart(e) {
	if(e.target.getAttribute("disabled") == "true"){
		e.dataTransfer.setData("application/coder-card", "NotInTurn");
	}else{
		e.dataTransfer.setData("application/coder-card", e.target.classList[0]);
	}
	if(document.querySelector("#draggedCard"))
		document.querySelector("#draggedCard").id = "";
	e.target.id = "draggedCard";
	e.dataTransfer.dropEffect = "move";
};

function getChildIndex(parent,child){
	for(let i=0;i<parent.children.length;i++){
		if(parent.children[i] == child){
			return i;
		}
	}
	return -1;
}

function redrawDiscardPile(newPile){
	let pile = document.querySelector(".discardPile");
	pile.innerHTML = "";
	for(let cardNum of newPile){
		let card = createCard(cardTypes[cardNum]);
		card.classList.remove("template");
		card.classList.remove("hidden");
		card.style.transform = "rotate("+(Math.random()-0.5)*45+"deg)";
		document.querySelector(".discardPile").appendChild(card);
	}
}