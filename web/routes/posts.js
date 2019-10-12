const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');
const vote_controller = require('../controllers/voteController');

router.get('/generate', [user_controller.get_user, post_controller.generate_post],
	(req, res, next) => {
		res.json({seed: res.seed, content});
	}
);

router.post('/submit', [user_controller.get_user, post_controller.submit_post],
	(req, res, next) => {
		res.redirect('/#recent');
	}
);

router.get('/recent', [
		user_controller.get_user, post_controller.get_recent_posts,
		post_controller.get_voted_flag_for_post_query
	], (req, res, next) => {
		res.json({recent_posts: res.locals.posts});
	}
);

router.get('/:id', [
			user_controller.get_user, post_controller.get_post,
		], (req, res, next) => {
	res.json({post_ID: res.locals.post.id});
});

get_vote_result = (res) => {
	console.log('sending voting result');
	res.json({
		net_votee_votes: res.locals.net_votee_votes,
		net_user_votes: res.locals.net_user_votes,
	});
}

router.post('/upvote/:id', [
			user_controller.get_user, post_controller.get_post,
			vote_controller.upvote_post
		], (req, res, next) => {
	get_vote_result(res);
	return;
});

router.post('/abstain/:id', [
	user_controller.get_user, post_controller.get_post,
	vote_controller.abstain_post
		], (req, res, next) => {
	get_vote_result(res);
});

router.post('/downvote/:id', [
			user_controller.get_user, post_controller.get_post,
			vote_controller.downvote_post
		], (req, res, next) => {
	get_vote_result(res);
});

module.exports = router;
