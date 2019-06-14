const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {type: String, required: false, max: 127},
	// TODO: IP address history
	// TODO: OAuth handle
});

module.exports = mongoose.model('User', UserSchema);
