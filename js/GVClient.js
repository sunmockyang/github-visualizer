// Written by Sunmock Yang for You.i hack day
/*
This is the main interface to controlling the app from an external input.

Check out the README.md file for details on adding functionality
*/

function GVClient (ballList, boidList, setMainBallAttr, createBall, mergeBall, setBallAttributes, createBoid) {
	this.setup();

	this.setMainBallAttr = setMainBallAttr;
	this.createBall = createBall;
	this.mergeBall = mergeBall;
	this.setBallAttributes = setBallAttributes;
	this.createBoid = createBoid;
	this.ballList = ballList;
	this.boidList = boidList;

	// Set to 30 seconds
	this.checkInterval = 30 * 1000;

	this.update();

	document.onkeypress = this.keyPress.bind(this);
}

// Image displayed in the center of the big circle
GVClient.prototype.imageURL = "img/youilogo.png";
GVClient.prototype.HOSTNAME = "http://localhost";
GVClient.prototype.PORT = "4567";
GVClient.prototype.GET_ALL_ENDPOINT = "/all";
GVClient.prototype.GET_ENDPOINT = "/pull";
GVClient.prototype.GET_MULTIPLE_ENDPOINT = "/pulls";

GVClient.prototype.setup = function() {
	// Overriding the text that appears in the text box
	GVBall.prototype.getName = PullRequestNameFunction;
	GVBoid.prototype.getName = CommentNameFunction;
};

GVClient.prototype.update = function() {
	// A looping update function to monitor external sources.
	if (this.ballList.length == 0) {
		httpGet(constructURL(this.HOSTNAME, this.PORT, this.GET_ALL_ENDPOINT), this.parse_request.bind(this))
	}
	else {
		prIDs = "";

		for (var i = 0; i < this.ballList.length; i++) {
			prIDs += ((prIDs == "") ? "?pr=" : ",") + this.ballList[i].id;
		};

		httpGet(constructURL(this.HOSTNAME, this.PORT, this.GET_ALL_ENDPOINT), this.parse_request.bind(this))
		httpGet(constructURL(this.HOSTNAME, this.PORT, this.GET_MULTIPLE_ENDPOINT, prIDs), this.parse_request.bind(this))
	}

	setTimeout(this.update.bind(this), this.checkInterval);
};

GVClient.prototype.parse_request = function(response) {
	dataPackage = JSON.parse(response);

	for (var i = 0; i < dataPackage.length; i++) {
		if (this.PRExists(dataPackage[i])){
			if (dataPackage[i].state != "open") {
				this.mergeBall(dataPackage[i].id);
			}
		}
		else {
			this.createBall(dataPackage[i]);
		}

		for (var j = 0; j < dataPackage[i].comments.length; j++) {
			if (!this.CommentExists(dataPackage[i].comments[j].id)){
				this.createBoid(dataPackage[i].id, dataPackage[i].comments[j]);
			}
		};
	};
};

GVClient.prototype.PRExists = function(attr) {
	for (var i = 0; i < this.ballList.length; i++) {
		if (this.ballList[i].id == attr.id) {
			return true;
		};
	};
	return false;
};

GVClient.prototype.CommentExists = function(number) {
	for (var i = 0; i < this.boidList.length; i++) {
		if (this.boidList[i].id == number) {
			return true;
		};
	};
	return false;
};

function PullRequestNameFunction() {
	return "Pull Request #" + this.id + ": " + this.status;
};

function CommentNameFunction() {
	return "Comment by " + this.name;
};

function httpGet(url, callback) {
	console.log(url)
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
};

function constructURL(hostname, port, endpoint, options) {
	return hostname + ":" + port + endpoint + ((options) ? options : "");
}

// Rest here is debug/example stuff

var nextID = 3200;
var randomNames = ["Sunmock Yang", "Joe Dirt", "You i", "the Manatee", "Mexican Android"]

GVClient.prototype.keyPress = function(e) {
	e = e || window.event;
	var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
	if (charCode) {
		// space
		if (charCode == 32){
			this.createBall(nextID++, "open", "#f79520", 20 + Math.random() * 10);
		}
		// enter
		else if (charCode == 13){
			this.mergeBall(this.getRandomBallID());
		}
		// a
		else if (charCode == 97){
			this.setBallAttributes(this.getRandomBallID(), {size: 20 + Math.random() * 10, colour: "#FF55FF"});
		}
		// b
		else if (charCode == 98){
			for (var i = 0; i < 100; i++) {
				this.createBoid(this.getRandomBallID(), "#559999", randomNames[Math.floor(Math.random() * randomNames.length)], Math.floor(Math.random() * 10000));
			}
		}
		// c
		else if (charCode == 99){
			this.setMainBallAttr({colour: "#4237ef", name:"The New Repository"});
		}
		else {
			console.log(charCode);
		}
	}
};

GVClient.prototype.getRandomBallID = function() {
	return this.ballList[Math.floor(this.ballList.length * Math.random())].id;
};