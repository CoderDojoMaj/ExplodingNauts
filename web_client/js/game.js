//WebSocket Stuff

let url = 'ws://' + document.location.host
let ws = new WebSocket(url)

//Possible Message Names/Types => addCard, drawCard, explodePlayer (?)...
ws.onmessage = (data) => {
	let message = data.data
	let sMessage = message.match(/(.+?)\0(.+)/)
	// console.log(sMessage, message)
	let messageData = sMessage[2]
	switch(sMessage[1].toUpperCase()){
		case 'ADD_CARDS':
			let arr = JSON.parse(messageData);
			console.log(arr)
			let cardArr = []
			for(let className of arr){
				let card = document.querySelector("."+className+".template").cloneNode(true);
				card.classList.remove("hidden")
				card.style.transform += "rotate("+(Math.random()-0.5)*20+"deg)";
				cardArr.push(card);
			}
			console.log(cardArr)
			cardsInStack=cardsInStack.concat(cardArr)
			redrawStack()
			if(arr.length==1 && arr[0]=="SeeTheFuture"){
				ws.send("REQ_SEETHEFUTURE\0 3");
			}
			break;
		// case 'STARTING_TIME':
		// 	document.getElementById("timer").innerText=messageData;
		// 	break;
		case "DRAW_CARD":
			let card = document.querySelector("."+cardTypes[parseInt(messageData)]+".template").cloneNode(true);
			card.classList.remove("hidden");
			card.classList.add("relative");
			hand.unshift(card);
			reloadHand();
			dragElement(card)
			break;
		case "ANS_SEETHEFUTURE":
			let answer = JSON.parse(messageData);
			let cardList=[];
			//Modify class adding/substracting if there's a better way
			for(let node of document.querySelectorAll("body>*:not(.template)")){
				if(node.id.substring(0,3)!="stf")
					node.classList.add("darken");
			}
			let cardNum=1;
			for(let card of answer){
				try{
					let actual = document.querySelector("."+cardTypes[parseInt(card)]+".template").cloneNode(true);
					actual.classList.remove("hidden");
					actual.classList.add("fake");
					actual.id=`stf_card${cardNum}`
					cardList.push(actual);
					cardNum++;
				}catch(e){
					cardList.push(null);
				}
			}
			document.getElementById("stf_card1").outerHTML=cardList[0]==null ? `<card id="stf_card1"></card>` : cardList[0].outerHTML;
			document.getElementById("stf_card2").outerHTML=cardList[1]==null ? `<card id="stf_card2"></card>` : cardList[1].outerHTML;
			document.getElementById("stf_card3").outerHTML=cardList[2]==null ? `<card id="stf_card3"></card>` : cardList[2].outerHTML;
			document.getElementById("stf_modal").classList.remove("hidden");
			break;
	}
}

ws.onopen = () => {
	ws.send(`HANDSHAKE\0${getCookie('EXPLODINGNAUTS_USER')}`)
}

//Game Stuff
let scrollRect = document.getElementById('scrollRect')

let stackHandSnapCard = document.getElementById('stackHandSnap')
let stackSnapCard = document.getElementById('stackSnap')
let snapElements = [stackHandSnapCard, stackSnapCard];

let cardsInStack=[];
let cardsInStackHand=[];
let cardZIndex=3;

let handScrollPos=0, maxHandScrollPos=0, handWidth=0;

let hand = [];
let cardTypes = ["ExplodingKitten", "Attack", "Defuse", "Nope", "SeeTheFuture", "Skip", "Favor", "Shuffle", "RainbowCat", "HairyPotatoCat", "TacoCat", "BeardCat", "Cattermelon"];
let cardNames = ["Exploding Kitten", "Attack", "Defuse", "Nope", "See The Future (x3)", "Skip", "Favor", "Shuffle", "Rainbow Cat", "Hairy Potato Cat", "Tacocat", "Beard Cat", "Cattermelon"];

document.querySelector("#username").innerText = getCookie("EXPLODINGNAUTS_USER");

function redrawStack(){
	let stack=document.querySelector(".stack");
	stack.innerHTML="";
	let z=cardZIndex;
	stack.appendChild(stackSnapCard);
	for(let card of cardsInStack){
		stack.appendChild(card);
		card.style.zIndex=z;
		z++;
	}
}

function redrawStackHand(){
	let stack=document.querySelector(".stackHand");
	stack.innerHTML="";
	let z=cardZIndex;
	stack.appendChild(stackHandSnapCard);
	for(let card of cardsInStackHand){
		stack.appendChild(card);
		card.style.zIndex=z;
		z++;
	}
}

function getStackHandInfo(){
	let classList=[];
	let canPush=false;
	for(let card of cardsInStackHand){
		classList.push(card.classList[0]);
	}
	if(classList.length==0){ //No Cards in StackHand
		document.querySelector(".stackHandInfo.error").style.visibility="hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility="hidden";
	}else if(classList[0]==classList[1] && classList.length==2 && classList[0].indexOf("Cat")!=-1){ //Same 2 cat cards
		document.querySelector(".stackHandInfo.error").style.visibility="hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility="visible";
		canPush=true;
	}else if(classList[0]==classList[1] && classList[1]==classList[2] && classList.length==3 && classList[0].indexOf("Cat")!=-1){ //Same 3 cat cards
		document.querySelector(".stackHandInfo.error").style.visibility="hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility="visible";
		canPush=true;
	}else if([...new Set(classList)].length==5 && classList.length==5){ //5 different cards
		document.querySelector(".stackHandInfo.error").style.visibility="hidden";
		document.querySelector(".stackHandInfo.correct").style.visibility="visible";
		canPush=true;
	}else{ //No valid combination
		document.querySelector(".stackHandInfo.error").style.visibility="visible";
		document.querySelector(".stackHandInfo.correct").style.visibility="hidden";
	}
	return canPush;
}

//Original from https://www.kirupa.com/html5/drag.htm
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
		if (active) {
			let elmnt_pos = elmnt.getBoundingClientRect()
			let snapped=false;
			for(let snapEl of snapElements){
				let snap_pos = snapEl.getBoundingClientRect()
				if (Math.abs(elmnt_pos.x - snap_pos.x) < 100 && Math.abs(elmnt_pos.y - snap_pos.y) < 100) {
					snapped=true;
					currentX += snap_pos.x - elmnt_pos.x
					currentY += snap_pos.y - elmnt_pos.y
					setTranslate(currentX, currentY, elmnt);
					snapEl.classList.add('vis_hidden')
					//console.log(currentX, currentY)

					if(snapEl.id=="stackSnap"){
						// /*elmnt.style.transform = "";
						// elmnt.style.transform += "rotate("+(Math.random()-0.5)*20+"deg)";
						// elmnt.classList.remove("relative");
						// cardsInStack.push(elmnt);*/
						let messageToSend=[elmnt.classList[0]];
						ws.send(`ADD_CARDS\0${JSON.stringify(messageToSend)}`);
						hand.splice(hand.indexOf(elmnt),1);
						reloadHand();
						//delete elmnt
						
						//redrawStack();
					}else if(snapEl.id=="stackHandSnap"){
						elmnt.style.transform = "";
						elmnt.style.transform += "rotate("+(Math.random()-0.5)*20+"deg)";
						elmnt.classList.remove("relative");
						cardsInStackHand.push(elmnt);
						hand.splice(hand.indexOf(elmnt),1);
						redrawStackHand();
						let canPush=getStackHandInfo();
						if(canPush){
							document.querySelector("#putMultiple").onclick=pushToStack;
						}else{
							xOffset=0;
							yOffset=0;
							document.querySelector("#putMultiple").onclick=pushToHand;
						}
					}
					if(document.querySelector(".hand").lastChild){
						handScrollPos+=document.querySelector(".hand").lastChild.getBoundingClientRect().width;
						handScroll({deltaY:0});
					}
				}
			}
			if(!snapped){
				elmnt.style.transform="";
				xOffset=0;
				yOffset=0;
			}

			// document.querySelector(".hand").style.overflowX = "auto";

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

			// document.querySelector(".hand").style.overflowX = "visible";

			// TODO snap to hand & stack

			let elmnt_pos = elmnt.getBoundingClientRect()
			for(let snapEl of snapElements){
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
	document.querySelector(".hand").innerHTML = "";
	let lastCard;
	for (let card of hand) {
		document.querySelector(".hand").appendChild(card);
		lastCard = card;
	}
	if(lastCard){
		let pos=lastCard.getBoundingClientRect();
		let style = window.getComputedStyle ? getComputedStyle(lastCard) : lastCard.currentStyle;
		handWidth=(pos.width+(parseInt(style.marginLeft || 0))*2)*hand.length;
		//Make scroll bar visible/invisible and resize itself
		if(isOffscreen(lastCard)){
			scrollRect.classList.remove('vis_hidden')
			scrollRect.style.width = window.innerWidth*100/handWidth+"vw"
		}else{
			scrollRect.classList.add('vis_hidden')
		}
	}
}

for (let el of document.querySelectorAll("card:not(.fake):not(.hidden)")) {
	dragElement(el);
}

document.querySelector(".deck").onclick = () => {
	// let card = document.createElement("card");
	// let index = Math.floor(Math.random() * (cardTypes.length));
	// card.className = cardTypes[index] + " relative";
	// card.innerText = cardNames[index];
	// hand.unshift(card); // Puts the card at the start, so that you see it when you draw it
	// reloadHand();
	// dragElement(card);
	ws.send("DRAW_CARD\0 ");
};

document.querySelector("#stf_ok").onclick = () => {
	for(let node of document.querySelectorAll("body>*:not(.template)")){
		if(node.id.substring(0,3)!="stf")
			node.classList.remove("darken");
	}
	document.getElementById("stf_modal").classList.add("hidden")
};

document.querySelector("#putMultiple").onclick = pushToStack;
function pushToStack(){
	let messageToSend=[];
	for(let card of cardsInStackHand){
		messageToSend.push(card.classList[0]);
	}
	ws.send(`ADD_CARDS\0${JSON.stringify(messageToSend)}`);
	//cardsInStack=cardsInStack.concat(cardsInStackHand);
	cardsInStackHand=[];
	redrawStackHand();
	//redrawStack();
	getStackHandInfo();
};

function pushToHand(){
	for(let card of cardsInStackHand){
		card.style.transform="";
		card.classList.add("relative");
	}
	hand=hand.concat(cardsInStackHand);
	cardsInStackHand=[];
	redrawStackHand();
	reloadHand();
	getStackHandInfo();
};

function isOffscreen(elmnt){
	let pos=elmnt.getBoundingClientRect();
	return pos.x<0 || pos.y<0 || pos.x+pos.width>window.innerWidth || pos.y+pos.height>window.innerHeight;
}

document.querySelector(".hand").onwheel = handScroll;

function handScroll(e){
	if(isOffscreen(document.querySelector(".hand").lastChild)){
		handScrollPos+=e.deltaY/2.5;
	}else if(e.deltaY>0){
		handScrollPos+=e.deltaY/2.5;
	}
	let lastChildPos=document.querySelector(".hand").lastChild.getBoundingClientRect();
	if(handScrollPos>0){
		handScrollPos=0
	}
	document.querySelector(".hand").style.left=handScrollPos+"px";
	scrollRect.style.left = Math.abs(handScrollPos)*window.innerWidth/handWidth+"px"
}

document.querySelector(".stackHandInfo.error").style.visibility="hidden";
document.querySelector(".stackHandInfo.correct").style.visibility="hidden";
