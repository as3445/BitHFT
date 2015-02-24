var buttercoin = require('buttercoin-node');
var client = buttercoin(
    'qc5aqwtfwx2vtez3dtl6xscpe92u18xh',
    'ppqPLo4eVurWfPhxcsEfupxVpWvRh5YT',
    'production',
    'v1'
);

var mongoose = require('mongoose');
mongoose.connect('mongodb://orangecube.io:27017/bithft');
require('./models.js');
var db = mongoose.connection;

db.once('open', function (callback) {
  // Main Loop Call
  setInterval(mainLoop, 700);
});


function mainLoop () {
	getTicker();
}


function getTicker (cb) {
	client.getTicker(function (err, ticker) {
	  if(err != null){
	  	//EROOOR HANDLING?!?!?
	  }else {
	  	var avg = (ticker.ask+ticker.bid)/2;
	  	var tick = {
	  		"last" : ticker.last,
	  		"ask"  : ticker.ask,
	  		"bid"  : ticker.bid,
	  		"avg"  : avg,
	  		"time" : Date.now()
	  	}

	  	var newTick = new global.tickerModel(tick);
	  	newTick.save(function(){
	  		if (err) console.error(err);
	  	});
	  }

	});
}