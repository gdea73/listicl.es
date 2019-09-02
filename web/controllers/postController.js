const listicles = require('./listiclesController');
const Post = require('../models/post');
const shortid = require('shortid');

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
		return next('Post validation failed. What\'re you tryna pull?');
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

// exports.get_posts(req, res, next) => {
// 	
// }
