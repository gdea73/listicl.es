const listicles = require('./listiclesController');

exports.generate_post = (req, res, next) => {
	if (!req.session.userId) {
		console.log('generate_post: no user ID present.');
	}
	let { seed, content } = listicles.generate();
	console.log(`result -- seed ${seed} content ${content}`);
	res.seed = seed;
	res.content = content;
	return next();
}
