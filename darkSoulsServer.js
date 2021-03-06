var mongoClient = require("mongodb").MongoClient;

var express = require("express");
var app = express();

var http = require("http");
var server = http.Server(app);

var socketIo = require("socket.io");
var io = socketIo(server);

var searchForItem = function(db, query, callbackFunction) {
	db.collection("weapons").find({"Object Name":query}, function(err, cursor) {
		if (err) throw err;
		cursor.forEach(function(item) {
			//console.log(item);
			callbackFunction(item);
		});
	});
};

var listCategory = function(db, query, callbackFunction) {
	db.collection("weapons").find({"Sub Category":query}, function(err, cursor) {
		var result = [];
		cursor.forEach(function(item) {
			//console.log(item);
			callbackFunction(item);
		});
	});
};

app.use(express.static("pub"));

io.on("connection", function(socket) {
	console.log("connection made from " + socket);
	//I'm going to leave this in here just in case something mysterious happens.
	socket.on("disconnect", function() {
		console.log(socket + " has disconnected.");
	});
	socket.on("search", function(query) {
		var regex = RegExp("([a-zA-Z0-9\']*" + query + "[a-zA-Z0-9\']*)", "gi");
		mongoClient.connect("mongodb://localhost:27017/DarkSoulsData", function(err, db) {
			if (err) throw err;
			console.log("Connected to Mongo.");
			searchForItem (db, regex, function(answer) {
				console.log(answer);
				socket.emit("searchReturn", JSON.stringify(answer));
			});
		});	
	});
	socket.on("list", function(query) {
		mongoClient.connect("mongodb://localhost:27017/DarkSoulsData", function(err, db) {
			if (err) throw err;
			console.log("Connected to Mongo.");
			listCategory (db, query, function(answer) {
				console.log(answer);
				socket.emit("listReturn", JSON.stringify(answer));
			});
		});
	});
});

server.listen(8080, function() {
	console.log("Server started and ready for requests.");
});
