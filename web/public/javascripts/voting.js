function upvote(sender) {
	vote(true, sender);
}

function downvote(sender) {
	vote(false, sender);
}

function update_class_on_child_SVG(sender, new_class_name) {
	/* unbelievabe how long it took to find out about baseVal */
	sender.querySelectorAll('use')[0].className.baseVal = new_class_name;
}

function update_net_votes(post_ID, result) {
	if (!result || !('net_votee_votes' in result)) {
		return;
	}

	let net_votes_element = document.getElementById('net_votes_' + post_ID);
	net_votes_element.innerHTML = result.net_votee_votes;
}

function abstain(was_up, sender) {
	let post_ID = sender.getAttribute('data-post_id');
	let xhr = new XMLHttpRequest();
	let new_onclick = function() { vote(was_up, this); };
	
	if (was_up) {
		new_class_name = 'upvote';
	} else {
		new_class_name = 'downvote';
	}

	xhr.open('POST', '/posts/abstain/' + post_ID, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState !== 4 || xhr.status !== 200) {
			return;
		}

		update_class_on_child_SVG(sender, new_class_name);
		let result = JSON.parse(xhr.responseText);

		update_net_votes(post_ID, result);

		sender.onclick = new_onclick;
	}
	xhr.send();
}

function vote(is_up, sender) {
	let post_ID = sender.getAttribute('data-post_id');
	let xhr = new XMLHttpRequest();
	let new_class_name = undefined;
	let new_onclick = function() { abstain(is_up, this); };

	if (is_up) {
		new_class_name = 'upvoted';
		xhr.open('POST', '/posts/upvote/' + post_ID, true);
	} else {
		new_class_name = 'downvoted';
		xhr.open('POST', '/posts/downvote/' + post_ID, true);
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState !== 4 || xhr.status !== 200) {
			return;
		}

		update_class_on_child_SVG(sender, new_class_name);
		let result = JSON.parse(xhr.responseText);

		update_net_votes(post_ID, result);

		sender.onclick = new_onclick;
	};
	xhr.send();
}
