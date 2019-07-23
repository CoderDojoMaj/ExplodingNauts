function blur(){
	document.getElementById("blurable").classList.add('darken')
}

function unblur(){
	document.getElementById("blurable").classList.remove('darken')
}

function closePeopleModal(){
	document.getElementById("people_modal").classList.add("hidden");
	unblur();
}

function openPeopleModal(){
	blur();
	document.getElementById("people_modal").classList.remove("hidden");
}

document.getElementById("people").onclick = openPeopleModal

document.getElementById("people_modal").onclick = closePeopleModal