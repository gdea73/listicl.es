const mongoose = require('mongoose');
const async = require('async');
const User = require('../models/user');

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
