const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const VoteSchema = new Schema({
	_id: {type: String, required: true, max: 255},
	user: {type: Schema.ObjectId, ref: 'User', required: true},
	timestamp: {type: Date, required: true, default: Date.now},
	isUp: {type: Boolean, required: true},
	votee: {type: Schema.ObjectId, ref: 'Post', required: true},
});

module.exports = mongoose.model('Vote', VoteSchema);
