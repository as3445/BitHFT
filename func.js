function getTicker() {
	client.getTicker(function (err, ticker) {
	  if(err != null){
	  	console.log("ticker err", err);
	  }else {
	    console.log("ticker", ticker);
	  }
	});
}