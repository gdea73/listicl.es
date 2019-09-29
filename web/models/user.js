const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	// most recent IP address; used in combination with the session cookie to
	// identify unregistered/anonymous users
	address: {type: String, required: true},
	isRegistered: {type: Boolean, default: false},
	// the fields below are required for registered users
	name: {type: String, required: false, max: 127},
	votes: [{type: Schema.ObjectId, ref: 'Vote', required: true}],
	google_profile_ID: {type: String, required: false},
	google_access_token: {type: String, required: false},
	net_votes: {type: Number, required: true, default: 0},
});

/* NOTE that "this" does not resolve to a User if arrow syntax is used to define getter */
UserSchema.virtual('display_name').get(function () {
	if (this.name) {
		return this.name;
	}
	let short_ID = this.id && this.id.toString().substring(21);
	return `Anonymous Clicker (${short_ID})`;
});

module.exports = mongoose.model('User', UserSchema);
