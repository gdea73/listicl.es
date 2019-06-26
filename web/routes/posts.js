const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

router.get('/generate', [user_controller.get_user, post_controller.generate_post], (req, res, next) => {
	res.send(`seed: ${res.seed}<br />content: ${res.content}`);
});

module.exports = router;
