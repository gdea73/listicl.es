const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	// most recent IP address; used in combination with the session cookie to
	// identify unregistered/anonymous users
	address: {type: String, required: true},
	isRegistered: {type: Boolean, default: false},
	// the fields below are required for registered users
	name: {type: String, required: false, max: 127},
	email: {type: String, required: false, max: 127},
	votes: [{type: Schema.ObjectId, ref: 'Vote', required: true}],
});

module.exports = mongoose.model('User', UserSchema);
