const mongoose = require('mongoose');
const async = require('async');
const User = require('../models/user');
const Post = require('../models/post');
const session = require('express-session');
const OAuth2Client = require('google-auth-library');

create_new_user = (ip, callback) => {
	const user = new User({
		address: ip,
	});
	user.save(callback);
}

exports.google_auth_callback = (
	req, access_token, refresh_token, profile, done
) => {
	error_handler = (err) => {
		console.log('error encountered during OAuth authentication');
		console.log(err);
		return done(err, null);
	};
	console.log(`authenticated: ${profile.id}`);
	User.findOne({google_profile_ID: profile.id}).exec()
	.then((user) => {
		if (user) {
			console.log(`restoring Google-authenticated session for user: ${user.id}`);
			/* write session JWT for existing (registered) user */
			req.session.userId = user.id;
			return done(null, user);
		} else {
			console.log(`upgrading user ${req.session.userId} to use Google authentication`);
			/* attach to current (presumably unregistered) session */
			User.findOneAndUpdate({
					_id: req.session.userId,
				}, {
					isRegistered: true,
					name: profile.displayName,
					google_profile_ID: profile.id,
					google_access_token: access_token,
				}
			).exec()
			.then((user) => { done(null, user) })
			.catch(error_handler);
		}
	})
	.catch(error_handler);
}

get_user_from_session = (req, res, next) => {
	error_handler = ((err) => {
		console.log('failed to get user from session: ' + err);
		return next(err);
	});

	User.findOne({_id: req.session.userId}).exec()
	.then((user) => {
		if (user) {
			res.locals.user = user;
			return next();
		} else {
			const err = new Error('invalid user ID');
			err.status = 404;
			return error_handler(err);
		}
	})
	.catch(error_handler);
}

exports.get_user = (req, res, next) => {
	if (req.session.userId) {
		console.log('Found user ID in session: ' + req.session.userId);
		return get_user_from_session(req, res, next);
	} else {
		console.log('Attempting to find user for IP: ' + req.ip);
		User.findOne({address: req.ip}, (err, user) => {
			if (err) {
				return next(err);
			}
			if (user && !user.isRegistered) {
				// save the matching user ID to the client's session
				req.session.userId = user.id;
				console.log('Existing user located with ID: ' + user.id);
				res.locals.user = user;
				return next();
			}
			console.log('Attempting to create NEW user for IP: ' + req.ip);
			create_new_user(req.ip, (err, user) => {
				if (err) {
					return next(err);
				}
				// save the new user ID to the client's session
				res.locals.user = user;
				req.session.userId = user.id;
				console.log('New user created successfully with ID: ' + user.id);
				return next();
			});
		});
	}
}

exports.my_user_detail = (req, res, next) => {
	return get_user_detail(req.session.userId, true, res, next);
}

exports.user_detail = (req, res, next) => {
	return get_user_detail(req.params.id, false, res, next);
}

// Display detail page for a specific user
get_user_detail = (id, is_me, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error('invalid user ID');
		err.status = 404;
		return next(err);
	}

	async.parallel({
		user: (callback) => {
			User.findById(id).exec(callback)
		},
		posts: (callback) => {
			Post.find({user: id})
			    .sort({likes: 1, timestamp: -1})
			    .exec(callback)
		},
	}, (err, results) => {
		if (err) {
			return next(err);
		}
		if (!results.user) {
			const err = new Error('unable to find user');
			err.status = 404;
			return next(err);
		}
		// user found successfully
		res.render('user_detail', {
			title: 'User Detail',
			is_me: is_me,
			current_user: res.locals.user,
			user: results.user,
			posts: results.posts,
		});
	});
}

exports.edit_name = (req, res, next) => {
	let user_ID = req.session.userId;
	let new_username = req.body.new_username;
	console.log(`changing username for ${user_ID} to ${new_username}`);
	User.findOneAndUpdate({
		_id: user_ID
	}, {
		$set: {name: new_username}
	}).exec()
	.then((user) => {
		return next();
	}).catch((err) => {
		console.log('encountered error changing username: ' + err);
		return next(err);
	});
}
