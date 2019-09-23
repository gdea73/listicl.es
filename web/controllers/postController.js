const listicles = require('./listiclesController');
const Post = require('../models/post');
const Vote = require('../models/vote');
const shortid = require('shortid');
const MIN_RECENT_POSTS = 10;
const DEFAULT_RECENT_POSTS = 30;
const MAX_RECENT_POSTS = 100;
const mongoose = require('mongoose');

exports.generate_post = (req, res, next) => {
	console.log(`generate_post: user ID: ${req.session.userId}`);

	let { seed, content } = listicles.generate();
	res.seed = seed;
	res.content = content;

	return next();
}

exports.submit_post = (req, res, next) => {
	var seed = req.body.seed;
	var content = req.body.content;
	if (!listicles.validate(seed, content)) {
		return next(new Error('Post validation failed.'));
	}

	var post = new Post({
		user: req.session.userId,
		shortId: shortid.generate(),
		content: content,
		likes: [],
		seed: seed,
		comments: []
	});

	post.save((err, result_post) => {
		if (err) {
			console.log(err);
			return next(err);
		}
		console.log(`post submitted with ID ${result_post.id}`);
		res.post_ID = result_post.id;
		return next();
	});
}

exports.get_post = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		const err = new Error('invalid post ID');
		err.status = 404;
		return next(err);
	}

	console.log('Attempting to find post for ID: ' + req.params.id);
	Post.findOne({_id: req.params.id}, (err, post) => {
		if (err) {
			return next(err);
		}
		if (!post) {
			const err = new Error('unable to find post');
			err.status = 404;
			return next(err);
		}
		res.post = post;
		return next();
	});
}

query_posts = (limit, sort, res, next) => {
	var query = Post.find().sort(sort).limit(limit).populate('user');
	query.exec((err, results) => {
		if (err) {
			return next(err);
		}
		res.posts = results;
		return next();
	});
}

exports.get_recent_posts = (req, res, next) => {
	var limit = req.query.limit || DEFAULT_RECENT_POSTS;
	limit = Math.min(Math.max(MIN_RECENT_POSTS, limit), MAX_RECENT_POSTS);
	query_posts(limit, {timestamp: -1}, res, next);
}

get_vote_ID = (post_ID, user_ID) => {
	return post_ID + ':' + user_ID;
}

find_vote = (post_ID, user_ID) => {
	Vote.findOne({_id: get_vote_ID(post_ID, user_ID)}, (err, vote) => {
		if (err) {
			return undefined;
		}
		return vote;
	});
}

insert_vote = (is_up, post_ID, user_ID, callback) => {
	let vote = Vote.findOneAndUpdate(
		{_id: get_vote_ID(post_ID, user_ID)}, {
			_id: get_vote_ID(post_ID, user_ID),
			isUp: is_up,
			post: post_ID
		}, {
			upsert: true
		}, callback
	);
}

remove_vote = (post_ID, user_ID) => {
	Vote.findOneAndRemove({_id: post_ID + user_ID});
}

exports.toggle_upvote = (req, res, next) => {
	return toggle_vote(true, req, res, next);
}

exports.toggle_downvote = (req, res, next) => {
	return toggle_vote(false, req, res, next);
}

update_net_gain = (post_ID, next) => {
	/* TODO */
	return next();
}

toggle_vote = (is_up, req, res, next) => {
	/* detect whether the user has upvoted this post already */
	const vote = find_vote(res.post.id, req.session.userId);
	var netGain = 0;

	if (vote) {
		if (vote.isUp != is_up) {
			/* replace existing vote of opposite direction */
			net_gain = 2;
			if (!is_up) {
				net_gain *= -1;
			}
			insert_vote(
				is_up, res.post.id, req.session.userId,
				(err, result) => {
					if (err) {
						return next(err);
					}
				}
			);
		} else {
			/* remove existing vote of same direction */
			netGain = -1;
			if (!remove_vote(res.post.id, req.session.userId)) {
				const err = new Error('Failed to remove vote');
				err.status = 500;
				return next(err);
			}
		}
	} else {
		insert_vote(
			is_up, res.post.id, req.session.userId,
			(err, result) => {
				if (err) {
					return next(err);
				}
			}
		);
	}

	return update_net_gain(res.post.id, next);
}
