const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('users');
});

/* GET user by ID */
router.get('/:id', user_controller.user_detail);

module.exports = router;
