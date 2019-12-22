const express = require('express');
const router = express.Router();
const passport = require('passport');

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

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

render_user_detail = (req, res) => {
	res.render('user_detail', {
		title: 'User Detail',
		current_user: res.locals.user,
		user: res.locals.details_user,
		posts: Object.values(res.locals.posts),
	});
}

router.get('/me', [
		user_controller.get_user, user_controller.my_user_detail,
		post_controller.get_voted_flag_for_post_query, render_user_detail
	]
);

user_detail = (req, res, next) => {
	if (req.session.userId === req.params.id) {
		return user_controller.my_user_detail(req, res, next);
	} else {
		return user_controller.user_detail(req, res, next);
	}
}

/* GET user by ID */
router.get('/:id', [
		user_controller.get_user, user_detail,
		post_controller.get_voted_flag_for_post_query, render_user_detail
	],
);

router.post('/edit_name', [user_controller.get_user, user_controller.edit_name], [
		user_controller.get_user, user_controller.my_user_detail,
		post_controller.get_voted_flag_for_post_query, render_user_detail
]);

module.exports = router;
