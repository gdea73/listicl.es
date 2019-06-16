const mongoose = require('mongoose');
const async = require('async');
const User = require('../models/user');
const session = require('express-session');

create_new_user = (ip, callback) => {
	const user = new User({
		addresses: [ip],
	});
	user.save(callback);
}

exports.get_user = (req, res, next) => {
	if (req.session.userId) {
		res.send('Your user ID: ' + req.session.userId);
	} else {
		create_new_user(req.ip, (err, user) => {
			if (err) {
				return next(err);
			}
			// save the new user ID to the client's session
			req.session.userId = user.id;
			res.send('New user created successfully with ID: ' + user.id);
		});
	}
}

// Display detail page for a specific user
exports.user_detail = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		const err = new Error('invalid user ID');
		err.status = 404;
		return next(err);
	}

	async.parallel({
		user: (callback) => {
			User.findById(req.params.id)
				.exec(callback)
		}
		// TODO: parallel request to retrieve comments by IDs
	}, (err, results) => {
		if (err) {
			return next(err);
		}
		if (results.user == null) {
			const err = new Error('unable to find user');
			err.status = 404;
			return next(err);
		}
		// user found successfully
		res.render('user_detail', { title: 'User Detail', user: results.user });
	});
}
