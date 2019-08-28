const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

/* GET home page. */
router.get('/', [user_controller.get_user, post_controller.generate_post], function(req, res, next) {
  res.render('index', { title: 'listicl.es', seed: res.seed, content: res.content });
});

module.exports = router;
