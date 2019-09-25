const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const PostSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User', required: true},
	timestamp: {type: Date, required: true, default: Date.now},
	shortId: {type: String, required: true, max: 15},
	content: {type: String, required: true, max: 511},
	votes: [{type: Schema.ObjectId, ref: 'Vote', required: true}],
	netVotes: {type: Number, required: true, default: 0},
	seed: {type: String, required: true},
	comments: [{type: Schema.ObjectId, ref: 'Comment', required: false}],
});

module.exports = mongoose.model('Post', PostSchema);
