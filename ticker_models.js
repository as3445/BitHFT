var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var tickerSchema = new Schema({
	last: Number,
	ask : Number,
	bid : Number,
	avg : Number,
	time: Number
});

var buttercoin_ticker = mongoose.model('tickers', tickerSchema);

var ticker_models = {
	"buttercoin" : buttercoin_ticker
}

module.exports = ticker_models;