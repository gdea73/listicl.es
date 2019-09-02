const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

/* GET user ID from session cookie (create one if necessary) */
router.get('/', user_controller.get_user, (req, res, next) => {
	res.json({userID: req.session.userId});
});

/* GET user by ID */
router.get('/:id', user_controller.user_detail);

module.exports = router;
