const express = require('express');
const router = express.Router();
const passport = require('passport');

const user_controller = require('../controllers/userController');

/* GET user ID from session cookie (create one if necessary) */
router.get('/', user_controller.get_user, (req, res, next) => {
	res.json({userID: req.session.userId});
});

router.get('/authenticate',
	passport.authenticate('google', { scope: ['profile'], session: false })
);

router.get('/authenticate/callback',
		[user_controller.get_user, passport.authenticate('google', { failureRedirect: '/users', session: false })],
		(req, res, next) => {
			return res.redirect('/users/me');
		},
);

router.get('/me', [user_controller.get_user], (req, res, next) => {
	return user_controller.my_user_detail(req, res, next);
});

/* GET user by ID */
router.get('/:id', user_controller.get_user, (req, res, next) => {
	if (req.session.userId === req.params.id) {
		return user_controller.my_user_detail(req, res, next);
	} else {
		return user_controller.user_detail(req, res, next);
	}
});

router.post('/edit_name', [user_controller.get_user, user_controller.edit_name],
		(req, res, next) => {
	return user_controller.my_user_detail(req, res, next);
});

module.exports = router;
