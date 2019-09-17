const listicles = require('./listiclesController');
const Post = require('../models/post');
const shortid = require('shortid');
const MIN_RECENT_POSTS = 10;
const DEFAULT_RECENT_POSTS = 30;
const MAX_RECENT_POSTS = 100;

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
		res.postID = result_post.id;
		return next();
	});
}

// exports.get_post = (req, res, next) => {
// }

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
