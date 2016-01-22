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
	this.checkInterval = 5 * 1000;

	this.update();

	document.onkeypress = this.keyPress.bind(this);
}

// Image displayed in the center of the big circle
GVClient.prototype.HOSTNAME = "http://localhost";
GVClient.prototype.PORT = "4567";
GVClient.prototype.GET_ALL_ENDPOINT = "/api/all";
GVClient.prototype.GET_ENDPOINT = "/api/pull";
GVClient.prototype.GET_MULTIPLE_ENDPOINT = "/api/pulls";

GVClient.prototype.setup = function() {
	// Overriding the text that appears in the text box
	GVBall.prototype.getName = PullRequestNameFunction;
	GVBoid.prototype.getName = CommentNameFunction;
	GVRepo.prototype.getName = RepoNameFunction;
};

GVClient.prototype.update = function() {
	// A looping update function to monitor external sources.
	httpGet(constructAPIURL(this.HOSTNAME, this.PORT, this.GET_ALL_ENDPOINT), this.parse_request.bind(this))

	setTimeout(this.update.bind(this), this.checkInterval);
};

GVClient.prototype.parse_request = function(response) {
	// console.log(response)
	dataPackage = JSON.parse(response);

	// Keep track of which has no status
	var mergedBallList = this.ballList.slice();

	for (var i = 0; i < dataPackage.length; i++) {
		var pr = this.getPRByID(dataPackage[i])
		if (pr){
			if (dataPackage[i].state == "open"){
				// If a ball has status "open" it is removed from the merged ball list
				var j;
				for (j = 0; j < mergedBallList.length; j++) {
					if (mergedBallList[j].id == dataPackage[i].id){
						break;
					}
				};
				mergedBallList.splice(j, 1);
			}
			else {
				this.mergeBall(dataPackage[i].id);
			}
		}
		else {
			pr = this.createBall(dataPackage[i]);
		}

		for (var j = 0; j < dataPackage[i].comments.length; j++) {
			var comment = this.getCommentByID(dataPackage[i].comments[j].id);
			if (comment){
				comment.setAttributes(dataPackage[i].comments[j]);
			}
			else {	
				this.createBoid(dataPackage[i].id, dataPackage[i].comments[j]);
			}
		};

		if (pr) {
			pr.calculateSize();
		}
	};

	// Merge all balls that did not receive a response
	for (var i = 0; i < mergedBallList.length; i++) {
		this.mergeBall(mergedBallList[i].id);
	};
};

GVClient.prototype.getPRByID = function(attr) {
	for (var i = 0; i < this.ballList.length; i++) {
		if (this.ballList[i].id == attr.id) {
			return this.ballList[i];
		};
	};
	return null;
};

GVClient.prototype.getCommentByID = function(number) {
	for (var i = 0; i < this.boidList.length; i++) {
		if (this.boidList[i].id == number) {
			return this.boidList[i];
		};
	};
	return null;
};

function PullRequestNameFunction() {
	return "Pull Request #" + this.name + ": " + this.status;
};

function CommentNameFunction() {
	return "Comment by " + this.name + " on #" + this.follow.name;
};

function RepoNameFunction() {
	var suffix = (this.owner == "My") ? "" : (strEndsWith(this.owner, "s") ? "\'" : "\'s")

	return this.owner + suffix + " " + this.name + " Repository";
};

function strEndsWith(str, suffix) {
    return str.match(suffix+"$")==suffix;
}

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

function constructAPIURL(hostname, port, endpoint, options) {
	var urlPath = (location.pathname).split("/");
	urlPath.pop()
	var url = ""

	for (var i = 0; i < urlPath.length; i++) {
		if (urlPath[i] != "") {
			url += "/" + urlPath[i];
		}
	};

	return url + endpoint + ((options) ? options : "");
	// Comment above and uncomment below if you want to run off a local server
	// return hostname + ":" + port + endpoint + ((options) ? options : "");
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