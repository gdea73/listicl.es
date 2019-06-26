const express = require('express');
const router = express.Router();

const post_controller = require('../controllers/postController');

router.get('/generate', post_controller.generate_post, (req, res, next) => {
	res.send(`seed: ${res.seed}<br />content: ${res.content}`);
});

module.exports = router;
