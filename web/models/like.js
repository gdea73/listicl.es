const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const LikeSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User', required: true},
	timestamp: {type: Date, required: true, default: Date.now}
});

module.exports = mongoose.model('Like', LikeSchema);
