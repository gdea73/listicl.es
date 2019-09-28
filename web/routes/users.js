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
			return res.redirect('/users/edit_details');
		},
);

router.get('/edit_details', [user_controller.get_user], (req, res, next) => {
	console.log(`local user: ${res.locals.user}`);
	res.render('edit_user_details', {title: 'Edit User Details', current_user: res.locals.user});
});

/* GET user by ID */
router.get('/:id', user_controller.get_user, user_controller.user_detail);

module.exports = router;
