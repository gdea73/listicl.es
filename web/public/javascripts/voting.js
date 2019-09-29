function upvote(post_ID) {
	vote(true, post_ID);
}

function downvote(post_ID) {
	vote(false, post_ID);
}

function vote(is_up, post_ID) {
	var xhr = new XMLHttpRequest();
	if (is_up) {
		xhr.open('GET', 'posts/upvote/' + post_ID, true);
	} else {
		xhr.open('GET', 'posts/downvote/' + post_ID, true);
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var result = JSON.parse(xhr.responseText);
			if (result.net_votee_votes) {
				var net_votes_post = document.getElementById('net_votes_' + post_ID);
				net_votes_post.innerHTML = result.net_votee_votes;
			}
		}
	};
	xhr.send();
}
