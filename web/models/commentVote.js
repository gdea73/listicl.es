const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const CommentVoteSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User', required: true},
	timestamp: {type: Date, required: true, default: Date.now},
	isUp: {type: Boolean, required: true},
	votee: {type: Schema.ObjectId, ref: 'Comment', required: true},
});

module.exports = mongoose.model('CommentVote', CommentVoteSchema);
