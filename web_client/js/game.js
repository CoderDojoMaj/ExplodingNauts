console.log(getCookie('EXPLODINGNAUTS_USER'))

let url = 'ws://'+document.location.host
let ws = new WebSocket(url)

ws.onmessage = (data) => {
	console.log(data.data)
}

ws.onopen = () => {
	
}

document.querySelector("#username").innerText=getCookie("EXPLODINGNAUTS_USER");
