var buttercoin = require('buttercoin-node');
var client = buttercoin(
    'qc5aqwtfwx2vtez3dtl6xscpe92u18xh',
    'ppqPLo4eVurWfPhxcsEfupxVpWvRh5YT',
    'production',
    'v1'
);

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://orangecube.io:27017/bithft';
// Use connect method to connect to the Server
setInterval(function(){
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected correctly to server");

	  db.close();
	});
	console.log("lol");
}, 500);