var fs = require('fs');
var buttercoin = require('buttercoin-node');
var client = buttercoin(
    'qc5aqwtfwx2vtez3dtl6xscpe92u18xh',
    'ppqPLo4eVurWfPhxcsEfupxVpWvRh5YT',
    'production',
    'v1'
);
var ticker_models = require('./ticker_models.js');
var mongoose = require('mongoose');

var db = mongoose.connection;
mongoose.connect('mongodb://orangecube.io:27017/bithft');

//Name ticker Objects
var buttercoin_ticker = ticker_models.buttercoin;

//Main loop iteration rate
var runRate = 700;

//Average of instantanious Pivot Value over a span of time given below
var LongPivot = 0;

//Get aveagre of averages from past x minutes [Long Term Pivot Span]
var LPSpan = 120;

//Max size of pivot array
var snapNeed = Math.ceil((LPSpan*60*1000)/runRate);

//Collection of instantanious averages
var pivot = [];

//Difference in bid/ask price and LP at which to buy/sell
var spread = {};
spread.buy = 0.5;
spread.sell = 0.5;
spread.init = 0.5;

//Latest ask and bid price based on the ticker
var askNow = 0;
var bidNow = 0;

//Previous Buy/Sell Price
var last = JSON.parse(fs.readFileSync('./lastBuySell.json'));

var balance = {};
updateBalance();




//initialize data
console.log("Connecting to mongodb...");
db.once('open', function (callback){
	console.log("Loading pivot averages...");
	getPivotAvgs();
  calcLongPivot();
});


setInterval(mainLoop, runRate);

function mainLoop(){
	if(pivot.length != 0){
		getTicker();
	}
}

function getTicker() {
	client.getTicker(function (err, ticker) {
	  if(err != null){
	  	console.log("ticker err", err);
	  }else {
	  	var avg = (ticker.ask+ticker.bid)/2;
        pivot.push(avg);
        calcLongPivot();
        console.log("B: " + ticker.bid + " P: " + avg + " A: " + ticker.ask + " -- LP: " + LongPivot);
        console.log("Last Buy: " + last.Buy + " -- Last Sell: " + last.Sell + " -- Last Action: " + last.Action);
        console.log("buy spread: " + (LongPivot-ticker.ask) + " -- R: " + spread.buy);
        console.log("sell spread: " + (ticker.bid-LongPivot) + " -- R: " + spread.sell);
        console.log();
	  	askNow = ticker.ask;
	  	bidNow = ticker.bid;
    	transact(LongPivot, askNow, bidNow);
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

function calcLongPivot(){
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

  //v1
  // var buyLogic = (lp-ask > spread.buy && (ask < last.Sell || last.Sell == 0));
  // var sellLogic = (bid-lp > spread.sell && (bid > last.Buy || last.Buy == 0));

  //v2
  var buyLogic = (lp-ask > spread.buy);
  var sellLogic = (bid-lp > spread.sell);

  if(buyLogic){
      //buy
      console.log("BUY BUY BUY BUY BUY BUY BUY BUY BUY BUY BUY");
      buy();
  }

  if(sellLogic){
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
	  "quantity": "0.020",
	  "price": bidNow.toString()
	}

	client.createOrder(order, function (err, msg) {
	  // console.log("cancel order err", err);
	  // console.log("cancel order", msg);
	  spread.buy = spread.init;
	  spread.sell += 0.5;
    if(last.Action == "" || last.Action == "buy"){
      last.Sell = bidNow;
      last.Action = "sell";
      fs.writeFile("./lastBuySell.json", JSON.stringify(last), function(){});
    }
	});
	
}

function buy(){
	var order = {
	  "instrument": "BTC_USD",
	  "side": "buy",
	  "orderType": "limit",
	  "quantity": "0.020",
	  "price": askNow.toString()
	}

	client.createOrder(order, function (err, msg) {
	  // console.log("cancel order err", err);
	  // console.log("cancel order", msg);
	  spread.buy += 0.5;
	  spread.sell = spread.init;
    if(last.Action == "" || last.Action == "sell"){
      last.Buy = askNow;
      last.Action = "buy";
      fs.writeFile("./lastBuySell.json", JSON.stringify(last), function(){});
    }
	});
	
}

function updateLastBuySell() {
  fs.writeFile('./lastBuySell.json')
}

//Can only be called inside when connection to mongo is open
function getPivotAvgs(){
	buttercoin_ticker.find().slice("avg", snapNeed).select("avg").exec(function (err, db_pivots){
		if(err) console.log(err);
		for(var i in db_pivots){
			pivot.push(db_pivots[i].avg);
		}
	});
}

function updateBalance(){
  client.getBalances(function (err, ticker) {
    if(err) { console.log("balances ERROR", err); } 
    else { balance = ticker; }
  });
}