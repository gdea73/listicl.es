const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	// recent IP addresses; used in combination with the session cookie to
	// identify unregistered/anonymous users in combination with the session
	// cookie
	addresses: [{type: String, required: true}],
	// the fields below are required for registered users
	name: {type: String, required: false, max: 127},
	email: {type: String, required: false, max: 127}
});

module.exports = mongoose.model('User', UserSchema);
