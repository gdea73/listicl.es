const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const CommentSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User', required: true},
	timestamp: {type: Date, required: true, default: Date.now},
	content: {type: String, required: true, max: 255},
	votes: [{type: Schema.ObjectId, ref: 'CommentVote', required: true}],
	netVotes: [{type: Number, required: true, default: 0}],
});

module.exports = mongoose.model('Comment', CommentSchema);
