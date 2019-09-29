const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Vote = require('../models/vote');
const CommentVote = require('../models/commentVote');

get_vote_ID = (votee_ID, user_ID) => {
	return votee_ID + ':' + user_ID;
}

find_vote = (collection, votee_ID, user_ID) => {
	return get_vote_collection(collection).findOne({
		_id: get_vote_ID(votee_ID, user_ID)
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

insert_vote = (is_up, collection, votee_ID, user_ID) => {
	return get_vote_collection(collection).findOneAndUpdate({
			_id: get_vote_ID(votee_ID, user_ID)
		}, {
			_id: get_vote_ID(votee_ID, user_ID),
			isUp: is_up,
			votee: votee_ID,
			user: user_ID,
		}, {
			upsert: true
		}
	).exec();
}

server_error = (error_message) => {
	const server_error = new Error(error_message);
	server_error.status = 500;
	return server_error;
}

update_points = (point_change, collection, votee_ID, req, res, next) => {
	let increment = {$inc: { net_votes: point_change }};
	console.log(`updating points: ${point_change}`);
	collection.findOneAndUpdate({ _id: votee_ID }, increment).exec()
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
			User.findOneAndUpdate({_id: votee.user}, increment).exec()
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
	find_vote(collection, votee_ID, req.session.userId)
	.then((vote) => {
		if (vote) {
			if (vote.isUp == is_up) {
				/* no-op; this vote already exists */
				console.log('no point change');
				point_change = 0;

				return next();
			} else {
				/* voter has changed mind; points change by +/- 2 */
				point_change *= 2;
			}
		}
		console.log(`point change: ${point_change}`);
		return insert_vote(is_up, collection, votee_ID, req.session.userId)
	})
	.then((vote) => {
		if (point_change) {
			return update_points(point_change, collection, votee_ID, req, res, next);
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
			return update_points(point_change, collection, votee_ID, req, res, next);
		}
		return next(); /* TODO: some kind of error handling here */
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
