const listicles = require('./listiclesController');

exports.generate_post = (req, res, next) => {
	console.log(`generate_post: user ID: ${req.session.userId}`);

	let { seed, content } = listicles.generate();
	res.seed = seed;
	res.content = content;

	return next();
}

// exports.get_posts(req, res, next) => {
// }
// 
// exports.submit_post = (req, res) => {
// }
