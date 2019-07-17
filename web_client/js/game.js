//WebSocket Stuff
console.log(getCookie('EXPLODINGNAUTS_USER'))

let url = 'ws://' + document.location.host
let ws = new WebSocket(url)

ws.onmessage = (data) => {
	console.log(data.data)
}

ws.onopen = () => {

}


//Game Stuff
let hand = [];
let cardTypes = ["ExplodingKitten", "Attack", "Defuse", "Nope", "SeeTheFuture", "Skip", "Favor", "Shuffle", "RainbowCat", "HairyPotatoCat", "Tacocat", "BeardCat", "Cattermelon"];
let cardNames = ["Exploding Kitten", "Attack", "Defuse", "Nope", "See The Future (x3)", "Skip", "Favor", "Shuffle", "Rainbow Cat", "Hairy Potato Cat", "Tacocat", "Beard Cat", "Cattermelon"];

document.querySelector("#username").innerText = getCookie("EXPLODINGNAUTS_USER");

//From https://www.kirupa.com/html5/drag.htm
function dragElement(elmnt) {
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
		initialX = currentX;
		initialY = currentY;

		active = false;
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

			// TODO snap to hand & stack

			setTranslate(currentX, currentY, elmnt);
		}
	}

	function setTranslate(xPos, yPos, el) {
		el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
	}
}


function reloadHand() {
	document.querySelector(".hand").innerHTML = "";
	for (let card of hand) {
		document.querySelector(".hand").appendChild(card);
	}
}

for (let el of document.querySelectorAll("card:not(.fake):not(.hidden)")) {
	dragElement(el);
}

document.querySelector(".deck").onclick = () => {
	let card = document.createElement("card");
	let index = Math.floor(Math.random() * (cardTypes.length));
	card.className = cardTypes[index] + " relative";
	card.innerText = cardNames[index];
	hand.push(card);
	reloadHand();
};