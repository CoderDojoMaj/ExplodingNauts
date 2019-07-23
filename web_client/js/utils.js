function redrawStack() {
	let stack = document.querySelector(".stack");
	stack.innerHTML = "";
	let z = cardZIndex;
	stack.appendChild(stackSnapCard);
	for (let card of cardsInStack) {
		stack.appendChild(card);
		card.style.zIndex = z;
		z++;
	}
}

function redrawStackHand() {
	let stack = document.querySelector(".stackHand");
	stack.innerHTML = "";
	let z = cardZIndex;
	stack.appendChild(stackHandSnapCard);
	for (let card of cardsInStackHand) {
		stack.appendChild(card);
		card.style.zIndex = z;
		z++;
	}
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

//Original from https://www.kirupa.com/html5/drag.htm
function dragElement(elmnt) {
	elmnt.isDraggable = true;
	let container = elmnt.parentElement;

	let active = false;
	let currentX;
	let currentY;
	let initialX;
	let initialY;
	let xOffset = 0;
	let yOffset = 0;

	container.addEventListener("mousedown", dragStart, false);
	container.addEventListener("mouseup", dragEnd, false);
	container.addEventListener("mousemove", drag, false);

	function dragStart(e) {
		if (elmnt.hasAttribute("disabled")) return false;
		if (e.type === "touchstart") {
			initialX = e.touches[0].clientX - xOffset;
			initialY = e.touches[0].clientY - yOffset;
		} else {
			initialX = e.clientX - xOffset;
			initialY = e.clientY - yOffset;
		}

		if (e.target === elmnt) {
			active = true;
		}

	}

	function dragEnd(e) {
		if (active) {
			let elmnt_pos = elmnt.getBoundingClientRect()
			let snapped = false;
			for (let snapEl of snapElements) {
				let snap_pos = snapEl.getBoundingClientRect()
				if (Math.abs(elmnt_pos.x - snap_pos.x) < 100 && Math.abs(elmnt_pos.y - snap_pos.y) < 100) {
					snapped = true;
					currentX += snap_pos.x - elmnt_pos.x
					currentY += snap_pos.y - elmnt_pos.y
					setTranslate(currentX, currentY, elmnt);
					snapEl.classList.add('vis_hidden')
					//console.log(currentX, currentY)

					if (snapEl.id == "stackSnap") {
						// /*elmnt.style.transform = "";
						// elmnt.style.transform += "rotate("+(Math.random()-0.5)*20+"deg)";
						// elmnt.classList.remove("relative");
						// cardsInStack.push(elmnt);*/
						let messageToSend = [elmnt.classList[0]];
						ws.send(`ADD_CARDS\0${JSON.stringify(messageToSend)}`);
						hand.splice(hand.indexOf(elmnt), 1);
						reloadHand();
						//delete elmnt

						//redrawStack();
					} else if (snapEl.id == "stackHandSnap") {
						elmnt.style.transform = "";
						elmnt.style.transform += "rotate(" + (Math.random() - 0.5) * 20 + "deg)";
						elmnt.classList.remove("relative");
						cardsInStackHand.push(elmnt);
						hand.splice(hand.indexOf(elmnt), 1);
						redrawStackHand();
						let canPush = getStackHandInfo();
						if (canPush) {
							document.querySelector("#putMultiple").onclick = pushToStack;
						} else {
							xOffset = 0;
							yOffset = 0;
							document.querySelector("#putMultiple").onclick = pushToHand;
						}
					}
					if (document.querySelector("#hand").lastChild) {
						handScrollPos += document.querySelector("#hand").lastChild.getBoundingClientRect().width;
						handScroll({ deltaY: 0 });
					}
				}
			}
			if (!snapped) {
				elmnt.style.transform = "";
				xOffset = 0;
				yOffset = 0;
			}

			// document.querySelector("#hand").style.overflowX = "auto";

			initialX = currentX;
			initialY = currentY;

			active = false;
		}
	}

	function drag(e) {
		if (active) {

			e.preventDefault();

			if (e.type === "touchmove") {
				currentX = e.touches[0].clientX - initialX;
				currentY = e.touches[0].clientY - initialY;
			} else {
				currentX = e.clientX - initialX;
				currentY = e.clientY - initialY;
			}

			xOffset = currentX;
			yOffset = currentY;

			// document.querySelector("#hand").style.overflowX = "visible";

			// TODO snap to hand & stack

			let elmnt_pos = elmnt.getBoundingClientRect()
			for (let snapEl of snapElements) {
				let snap_pos = snapEl.getBoundingClientRect()
				if (Math.abs(elmnt_pos.x - snap_pos.x) < 100 && Math.abs(elmnt_pos.y - snap_pos.y) < 100) {
					snapEl.classList.remove('vis_hidden')
				} else {
					snapEl.classList.add('vis_hidden')
				}
			}

			setTranslate(currentX, currentY, elmnt);
		}
	}

	function setTranslate(xPos, yPos, el) {
		// console.log(xPos, yPos)
		el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
	}
}

function reloadHand() {
	document.querySelector("#hand").innerHTML = "";
	let lastCard;
	for (let card of hand) {
		document.querySelector("#hand").appendChild(card);
		lastCard = card;
	}
	calcElementWidth(document.querySelector("#hand"), scrollRect)
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
	}
	ws.send(`ADD_CARDS\0${JSON.stringify(messageToSend)}`);
	//cardsInStack=cardsInStack.concat(cardsInStackHand);
	cardsInStackHand = [];
	redrawStackHand();
	//redrawStack();
	getStackHandInfo();
};

function pushToHand() {
	if (document.querySelector("#putMultiple").hasAttribute("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	for (let card of cardsInStackHand) {
		card.style.transform = "";
		card.classList.add("relative");
	}
	hand = hand.concat(cardsInStackHand);
	cardsInStackHand = [];
	redrawStackHand();
	reloadHand();
	getStackHandInfo();
};

function isOffscreen(elmnt) {
	let pos = elmnt.getBoundingClientRect();
	return pos.x < 0 || pos.y < 0 || pos.x + pos.width > window.innerWidth || pos.y + pos.height > window.innerHeight;
}

function handScroll(e) {
	if (isOffscreen(document.querySelector("#hand").lastChild)) {
		handScrollPos += e.deltaY / 2.5;
	} else if (e.deltaY > 0) {
		handScrollPos += e.deltaY / 2.5;
	}
	let lastChildPos = document.querySelector("#hand").lastChild.getBoundingClientRect();
	if (handScrollPos > 0) {
		handScrollPos = 0
	}
	document.querySelector("#hand").style.left = handScrollPos + "px";
	scrollRect.style.left = Math.abs(handScrollPos) * window.innerWidth / handWidth + "px"
}

function scrollableElement(e) {
	console.log(e)
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
		console.log(e)
		let pos = Math.min(Math.round((e.x-document.getElementById("defused_cards").scrollPos) / 176), localDeck.length) * 176;	// Add scroll pos
		ek_position_defused.style.left = `${pos - ek_position_defused .getBoundingClientRect().width / 2}px`
	}
}

function addClassToAll(parentElmnt, className, disableClickables, disableDraggables, exceptId = "") {
	for (let node of parentElmnt.querySelectorAll("*:not(.template)")) {
		if (node.id.indexOf(exceptId) == -1) {
			node.classList.add(className);
			if (node.onclick && disableClickables) node.setAttribute("disabled", true)
			if (node.isDraggable && disableDraggables) node.setAttribute("disabled", true)
			if (node.childElementCount > 0) addClassToAll(node, className, disableClickables, disableDraggables, exceptId);
		}
	}
}

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