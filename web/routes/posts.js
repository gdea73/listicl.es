const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');
const vote_controller = require('../controllers/voteController');

router.get('/generate', [user_controller.get_user, post_controller.generate_post], (req, res, next) => {
	res.json({seed: res.seed, content});
});

router.post('/submit', [user_controller.get_user, post_controller.submit_post], (req, res, next) => {
	res.redirect('/#recent');
});

router.get('/recent', [post_controller.get_recent_posts]);

router.get('/:id', [
			user_controller.get_user, post_controller.get_post,
		], (req, res, next) => {
	res.json({post_ID: res.locals.post.id});
});

router.get('/upvote/:id', [
			user_controller.get_user, post_controller.get_post,
			vote_controller.upvote_post
		], (req, res, next) => {
	res.json({netVotes: res.locals.netVotes});
});

router.get('/abstain/:id', [
	user_controller.get_user, post_controller.get_post,
	vote_controller.abstain_post
]);

router.get('/downvote/:id', [
	user_controller.get_user, post_controller.get_post,
	vote_controller.downvote_post
]);

module.exports = router;
