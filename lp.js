var fs = require('fs');
var buttercoin = require('buttercoin-node');
var client = buttercoin(
    'qc5aqwtfwx2vtez3dtl6xscpe92u18xh',
    'ppqPLo4eVurWfPhxcsEfupxVpWvRh5YT',
    'production',
    'v1'
);

function getTicker() {
	client.getTicker(function (err, ticker) {
	  if(err != null){
	  	console.log("ticker err", err);
	  }else {
	  	var avg = (ticker.ask+ticker.bid)/2;
	  }
	});
}