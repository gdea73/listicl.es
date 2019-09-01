const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

router.get('/generate', [user_controller.get_user, post_controller.generate_post], (req, res, next) => {
	res.json({seed: res.seed, content});
});

router.post('/submit', [user_controller.get_user, post_controller.submit_post], (req, res, next) => {
	res.json({postID: res.postID});
});

module.exports = router;
