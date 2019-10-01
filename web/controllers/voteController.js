const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Vote = require('../models/vote');
const CommentVote = require('../models/commentVote');

get_vote_ID = (votee_ID, user_ID) => {
	return votee_ID + ':' + user_ID;
}

find_vote = (collection, vote_ID) => {
	console.log('trying to find vote: ' + vote_ID);
	return get_vote_collection(collection).findOne({
		_id: vote_ID
	}).exec();
}

get_vote_collection = (votee_collection) => {
	if (votee_collection == Post) {
		return Vote;
	}

	if (collection == Comment) {
		return CommentVote;
	}

	return undefined;
}

insert_vote = (is_up, existing_vote, collection, votee_ID, user_ID) => {
	let vote_collection = get_vote_collection(collection);
	let vote = new vote_collection({
		_id: get_vote_ID(votee_ID, user_ID),
		isUp: is_up,
		timestamp: Date.now(),
		votee: votee_ID,
		user: user_ID,
	});
	vote.isNew = !existing_vote;
	return vote.save();
}

server_error = (error_message) => {
	const server_error = new Error(error_message);
	server_error.status = 500;
	return server_error;
}

update_votee = (point_change, collection, votee_ID, vote_update, req, res, next) => {
	let increment = {$inc: { net_votes: point_change }};
	let updates = {...increment, ...vote_update};
	console.log(`updating points: ${point_change}`);
	collection.findOneAndUpdate({ _id: votee_ID }, updates).exec()
	.then((votee) => {
		/* votee, as returned from findOneAndUpdate, does not have our
		 * modification to 'net_votes' applied, but, because it was successful,
		 * we can infer the final value from the previous plus the change. */
		res.locals.net_votee_votes = Number(votee.net_votes) + point_change;
		console.log('points updated on votee');
		console.log(`owner: "${votee.user}"; user: "${req.session.userId}"`);
		if (votee.user.toString() === req.session.userId) {
			console.log('self voting');
			return next();
		} else {
			User.findOneAndUpdate({_id: votee.user}, updates).exec()
			.then((user) => {
				res.locals.net_user_votes = Number(user.net_votes) + point_change;
				console.log('points updated on user');
				return next();
			})
			.catch((err) => {
				return next(err);
			});
		}
	})
	.catch((err) => {
		return next(err);
	});
}

add_vote = (is_up, collection, votee_ID, req, res, next) => {
	/* if the user hasn't voted on this post/comment before,
	 * then the points change by +/-1, depending on vote direction */
	let point_change = (is_up) ? 1 : -1;
	let vote_ID = get_vote_ID(votee_ID, req.session.userId);
	find_vote(collection, vote_ID)
	.then((vote) => {
		if (vote) {
			if (vote.isUp == is_up) {
				/* no-op; this vote already exists */
				console.log('no point change');
				point_change = 0;
			} else {
				/* voter has changed mind; points change by +/- 2 */
				point_change *= 2;
			}
		}
		console.log(`point change: ${point_change}`);
		return insert_vote(is_up, vote, collection, votee_ID, req.session.userId);
	})
	.then((vote) => {
		if (vote) {
			/* add the vote ID to the user's vote collection */
			let user = res.locals.user;
			user.votes.push(vote.id);
			return user.save();
		} else if (point_change > 0) {
			console.log('error: failed to insert vote');
		}
	})
	.then((user) => {
		if (point_change) {
			let vote_update = {$addToSet: {votes: vote_ID}};
			return update_votee(point_change, collection, votee_ID, vote_update,
					req, res, next);
		} else {
			return next();
		}
	})
	.catch((err) => {
		console.log('error when voting: ' + err);
		return next(err);
	});
}

remove_vote = (collection, votee_ID, req, res, next) => {
	get_vote_collection(collection).findOneAndRemove(
		{_id: get_vote_ID(votee_ID, req.session.userId)}
	).exec()
	.then((vote) => {
		if (vote) {
			let point_change = (vote.isUp) ? -1 : 1;
			let vote_update = {$pull: {votes: vote.id}};
			return update_votee(point_change, collection, votee_ID, vote_update,
					req, res, next);
		} else {
			console.log('no vote found to remove');
			return next();
		}
	})
	.catch((err) => {
		return next(err);
	});
}

exports.upvote_post = (req, res, next) => {
	return add_vote(true, Post, res.locals.post.id, req, res, next);
}

exports.abstain_post = (req, res, next) => {
	return remove_vote(Post, res.locals.post.id, req, res, next);
}

exports.downvote_post = (req, res, next) => {
	return add_vote(false, Post, res.locals.post.id, req, res, next);
}

exports.upvote_comment = (req, res, next) => {
	return add_vote(true, Comment, res.locals.post.id, req, res, next);
}

exports.abstain_comment = (req, res, next) => {
	return abstain(Comment, res.locals.post.id, req, res, next);
}

exports.downvote_comment = (req, res, next) => {
	return add_vote(false, Comment, res.locals.post.id, req, res, next);
}
