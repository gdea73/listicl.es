const listicles = require('./listiclesController');
const Post = require('../models/post');
const Vote = require('../models/vote');
const VoteController = require('../controllers/voteController');
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
		votes: [],
		netVotes: 0,
		seed: seed,
		comments: []
	});

	post.save((err, result_post) => {
		if (err) {
			console.log(err);
			return next(err);
		}
		console.log(`post submitted with ID ${result_post.id}`);
		res.locals.post_ID = result_post.id;
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
		res.locals.post = post;
		return next();
	});
}

query_posts = (limit, sort, res, next) => {
	var query = Post.find().sort(sort).limit(limit).populate('user');
	query.exec()
	.then((results) => {
		console.log('queried posts successfully');
		res.locals.posts = results;
		return next();
	})
	.catch((err) => {
		console.log('error querying posts: ' + err);
		return next(err);
	});
}

exports.get_voted_flag_for_post_query = (req, res, next) => {
	res.locals.posts = map_posts(res.locals.posts);
	let vote_IDs = Object.keys(res.locals.posts);
	vote_IDs.forEach((post_ID, index, vote_IDs) => {
		vote_IDs[index] = VoteController.get_vote_ID(post_ID, req.session.userId);
	});
	Vote.find({_id: {$in: vote_IDs}}).exec()
	.then((votes) => {
		let i = 0;
		for (i = 0; i < votes.length; i++) {
			let vote = votes[i];
			let expanded_vote_ID = VoteController.expand_vote_ID(vote.id);
			let client_voted = (vote.isUp) ? 1 : -1;
			res.locals.posts[expanded_vote_ID.votee_ID].set(
				'client_voted', client_voted, {strict: false}
			);
			/* EJS can't display an arbitrary field set on a Mongoose document;
			   the set() method above places it in _doc, though doesn't seem to
			   create a top-level getter on the object either.

			   res.locals.posts[expanded_vote_ID.votee_ID].client_voted = client_voted;
			 */
		}
		return next();
	})
	.catch((err) => {
		console.log(`error encountered searching votes to map to post query: ${err}`);
	});
}

map_posts = (posts) => {
	let posts_mapped = Object.assign(
		{},
		...(posts.map(post => ({[post.id]: post})))
	);
	return posts_mapped;
}

exports.get_recent_posts = (req, res, next) => {
	console.log('getting recent posts...');
	var limit = req.query.limit || DEFAULT_RECENT_POSTS;
	limit = Math.min(Math.max(MIN_RECENT_POSTS, limit), MAX_RECENT_POSTS);
	return query_posts(limit, {timestamp: -1}, res, next);
}

