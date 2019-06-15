const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const CommentSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User', required: true},
	timestamp: {type: Date, required: true, default: Date.now},
	content: {type: String, required: true, max: 255},
	likes: {type: Schema.ObjectId, ref: 'Like', required: true}
});

module.exports = mongoose.model('Comment', CommentSchema);
