var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var tickerSchema = new Schema({
	last: Number,
	ask : Number,
	bid : Number,
	avg : Number,
	time: Number
});

global.tickerModel = mongoose.model('tickers', tickerSchema);