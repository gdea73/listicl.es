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
	passport.authenticate('google', { failureRedirect: '/', session: false }),
	(req, res) => {
		console.log('successful authentication');
		res.redirect('/');
	}
);

/* GET user by ID */
router.get('/:id', user_controller.user_detail);

module.exports = router;
