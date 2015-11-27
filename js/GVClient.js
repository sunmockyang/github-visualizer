// Written by Sunmock Yang for You.i hack day
/*
This is the main interface to controlling the app from an external input.

Check out the README.md file for details on adding functionality
*/


function GVClient (ballList, setMainBallAttr, createBall, mergeBall, setBallAttributes, createBoid) {
	this.setup();

	this.setMainBallAttr = setMainBallAttr;
	this.createBall = createBall;
	this.mergeBall = mergeBall;
	this.setBallAttributes = setBallAttributes;
	this.createBoid = createBoid;
	this.ballList = ballList;

	// this.checkInterval = 100;

	for (var i = 0; i < 10; i++) {
		this.createBall(nextID++, "open", "#f79520", 20 + Math.random() * 10);
	};

	this.update();

	document.onkeypress = this.keyPress.bind(this);
}

// Image displayed in the center of the big circle
GVClient.prototype.imageURL = "img/youilogo.png";

GVClient.prototype.setup = function() {
	// Overriding the text that appears in the text box
	GVBall.prototype.getName = PullRequestNameFunction;
	GVBoid.prototype.getName = CommentNameFunction;
};

GVClient.prototype.update = function() {
	// A looping update function to monitor external sources.
	// Not currently used. Uncomment the next line to loop.
	// setTimeout(this.update.bind(this), this.checkInterval);
};

function PullRequestNameFunction() {
	return "Pull Request #" + this.id + ": " + this.status;
};

function CommentNameFunction() {
	return "Comment by " + this.name;
};

// Rest here is debug/example stuff

var nextID = 32;
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
				this.createBoid(this.getRandomBallID(), "#559999", randomNames[Math.floor(Math.random() * randomNames.length)]);
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