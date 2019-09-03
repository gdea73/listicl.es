const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

router.get('/generate', [user_controller.get_user, post_controller.generate_post], (req, res, next) => {
	res.json({seed: res.seed, content});
});

router.post('/submit', [user_controller.get_user, post_controller.submit_post], (req, res, next) => {
	res.redirect('/#recent');
});

router.get('/recent', [post_controller.get_recent_posts]);

// router.get('/:id', [user_controller.get_user, post_controller.get_post], (req, res, next) => {
// 	res.
// });

module.exports = router;
