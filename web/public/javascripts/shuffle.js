function renderNewListicle() {
	var responseJSON = JSON.parse(this.responseText);
	var content = document.getElementById('content');
	content.innerHTML = responseJSON.content;
	var seed = document.getElementById('seed');
	seed.innerHTML = responseJSON.seed;
}

function copyContent() {
	var content = document.getElementById('content');
	var formContent = document.getElementById('formContent');
	formContent.value = content.innerHTML;

	return true;
}

function shuffleF() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', renderNewListicle);
	xhr.open('GET', '/posts/generate');
	xhr.send();
}
