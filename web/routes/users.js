const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

/* GET users listing. */
router.get('/', user_controller.get_user, (req, res, next) => {
	res.send('user ID?' + req.session.userId);
});

/* GET user by ID */
router.get('/:id', user_controller.user_detail);

module.exports = router;
