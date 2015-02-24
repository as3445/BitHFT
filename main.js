var buttercoin = require('buttercoin-node');
var client = buttercoin(
    'qc5aqwtfwx2vtez3dtl6xscpe92u18xh',
    'ppqPLo4eVurWfPhxcsEfupxVpWvRh5YT',
    'production',
    'v1'
);

//Main loop iteration rate
var runRate = 700;

//Average of instantanious Pivot Value over a span of time given below
var LongPivot = 0;

//Get aveagre of averages from past x minutes [Long Term Pivot Span]
var LPSpan = 120;

//Difference in bid/ask price and LP at which to buy/sell
var spread = {};
spread.buy = 0.1;
spread.sell = 0.1;
spread.init = 0.1;

//Collection of instantanious averages
var pivot = [];

//Latest ask and bid price based on the ticker
var askNow = 0;
var bidNow = 0;




setInterval(mainLoop, runRate);

function mainLoop(){
	getTicker();
	transact(LongPivot, askNow, bidNow);
}

function getTicker() {
	client.getTicker(function (err, ticker) {
	  if(err != null){
	  	console.log("ticker err", err);
	  }else {
	  	var avg = (ticker.ask+ticker.bid)/2;
	  	pivot.push(avg);
	  	getLongPivot()
	  	console.log("B: " + ticker.bid + " P: " + avg + " A: " + ticker.ask);
	  	console.log("LP: " + LongPivot);
	  	console.log("buy spread: " + (LongPivot-ticker.ask));
		console.log("sell spread: " + (ticker.bid-LongPivot));
	  	console.log();
	  	askNow = ticker.ask;
	  	bidNow = ticker.bid;
	    // console.log("ticker", ticker);
	  }
	});
}

function getOrderBook() {
	client.getOrderbook(function (err, orderBook) {
		if(err != null){
		  console.log("order book err", err);
		}else{
			console.log("order book", orderBook);
		}
	});
}

function getTradeHistory() {
	client.getTradeHistory(function (err, trades) {
		if(err != null){
			console.log("trades err", err);
		}
    	else{
			console.log("trade history", trades);
			console.log(trades.length);
    	}
  });
}

function getLongPivot(){
	var snapNeed = (LPSpan*60*1000)/runRate;
	var pivotCalc = [];

	//snap conditions
	if(pivot.length > snapNeed){
		var start = pivot.length-snapNeed;
		pivotCalc = pivot.splice(start, pivot.length);
		pivot = pivotCalc;
	}else{
		pivotCalc = pivot;
	}

	var total = 0;

	for(var i=0; i < pivotCalc.length; i++){
		total += pivotCalc[i];
	}

	//set long pivot
	LongPivot = total/pivotCalc.length;
	return total/pivotCalc.length;

}

function transact(lp, ask, bid) {
	if(lp-ask > spread.buy){
		//buy
		console.log("BUY BUY BUY BUY BUY BUY BUY BUY BUY BUY BUY");
		buy();
	}

	if(bid-lp > spread.sell){
		//sell
		console.log("SELL SELL SELL SELL SELL SELL SELL SELL SELL");
		sell();
	}
}

function sell(){
	var order = {
	  "instrument": "BTC_USD",
	  "side": "sell",
	  "orderType": "limit",
	  "quantity": "0.005",
	  "price": bidNow.toString()
	}

	client.createOrder(order, function (err, msg) {
	  // console.log("cancel order err", err);
	  // console.log("cancel order", msg);
	  spread.buy = spread.init;
	  spread.sell += 0.05;
	});
	
}

function buy(){
	var order = {
	  "instrument": "BTC_USD",
	  "side": "buy",
	  "orderType": "limit",
	  "quantity": "0.005",
	  "price": askNow.toString()
	}

	client.createOrder(order, function (err, msg) {
	  // console.log("cancel order err", err);
	  // console.log("cancel order", msg);
	  spread.buy += 0.05;
	  spread.sell = spread.init;
	});
	
}