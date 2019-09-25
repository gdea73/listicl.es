const Post = require('../models/post');
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
			is_up: is_up,
			post: votee_ID
		}, {
			upsert: true
		}
	).exec();
}

update_net_gain = (collection, votee_ID, next) => {
	/* TODO */
	return next();
}

server_error = (error_message) => {
	const server_error = new Error(error_message);
	server_error.status = 500;
	return server_error;
}

update_points = (score_change, collection, votee_ID, res, next) => {
	collection.findOneAndUpdate({
			_id: votee_ID
		}, {
			$inc: { netVotes: score_change }
		}
	).exec()
	.then((votee) => {
		res.locals.netVotes = votee.netVotes;
		return next();
	})
	.catch((err) => {
		return next(err);
	});
}

add_vote = (is_up, collection, votee_ID, req, res, next) => {
	find_vote(collection, votee_ID, req.session.userId)
	.then((vote) => {
		/* usually the points will change by +/-1 */
		let point_change = (is_up) ? 1 : -1;
		if (vote) {
			if (vote.is_up == is_up) {
				/* no-op; this vote already exists */
				return next();
			}
			/* voter has changed mind; points change by +/- 2 */
			point_change *= 2;
		}
		insert_vote(is_up, collection, votee_ID)
		.then((vote) => {
			return update_points(point_change, collection, votee_ID, res, next);
		})
		.catch((err) => {
			return next(err);
		});
	})
	.catch((err) => {
		return next(err);
	});
}

remove_vote = (collection, votee_ID, req, res, next) => {
	get_vote_collection(collection).findOneAndRemove(
		{_id: get_vote_ID(votee_ID, req.session.userId)}
	).exec()
	.then((vote) => {
		if (vote) {
			let point_change = 0;
			if (vote.isUp) {
				point_change = 1;
			} else {
				point_change = -1;
			}
			update_points(
				point_change, collection, votee_ID, res, next
			);
		}
	});
	return next(server_error('failed to remove vote'));
}

exports.upvote_post = (req, res, next) => {
	return add_vote(true, Post, res.locals.post.id, req, res, next);
}

exports.abstain_post = (req, res, next) => {
	return remove_vote(false, Post, res.locals.post.id, req, res, next);
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
