const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

/* GET home page. */
router.get('/', [
		user_controller.get_user, post_controller.generate_post,
		post_controller.get_recent_posts, post_controller.get_voted_flag_for_post_query
	], (req, res, next)  => {
		res.render('index', {
			title: 'listicl.es',
			seed: res.seed,
			content: res.content,
			posts: Object.values(res.locals.posts),
			current_user: res.locals.user,
		});
	}
);

module.exports = router;
