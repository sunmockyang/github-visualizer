function GithubVisualizer(canvas){
	var width = 600;
	var height = 600;

	// Setup canvas
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.canvas.width = width;
	this.canvas.height = height;

	this.world = this.setupPhysics();

	// Setup pLink
	this.camera = new GVCamera(this.context);

	this.drops = [];

	for (var i = 0; i < 10; i++) {
		this.drops.push(new GVBall());
		this.addObject(this.drops[i]);
	};

	this.camera.setFollowObject(this.drops[0]);
	this.drops[0].colour = new Color(0, 0, 255).toHex();
	// this.camera.lookAt(this.drops[0].pos);

	// Setup input
	this.mouse = new LibraryMouse(this.canvas);
	this.mouse.addEventListener("mousemove", this.onMouseMove.bind(this));
	this.mouse.addEventListener("mouseover", function(){});
	this.mouse.addEventListener("mouseout", function(){});
	this.mouse.addEventListener("mousedown", function(){});
	this.mouse.addEventListener("mouseup", function(){});
	this.mouse.addEventListener("click", this.onMouseClick.bind(this));

	this.run();
};

GithubVisualizer.prototype.setupPhysics = function() {
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(2000, 2000);
	var gravity = new b2Vec2(0, 1000);
	var doSleep = false;
	var world = new b2World(worldAABB, gravity, doSleep);


	var groundSd = new b2BoxDef();
	groundSd.extents.Set(1000, 50);
	groundSd.restitution = 0.2;
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(0, 700);
	world.CreateBody(groundBd);

	return world;
};

GithubVisualizer.prototype.onMouseMove = function() {};

GithubVisualizer.prototype.onMouseClick = function() {
	var worldSpace = this.camera.convertCameraToWorldSpace(this.mouse.x, this.mouse.y);
};

GithubVisualizer.prototype.addObject = function(obj) {
	this.camera.addObject(obj);

	if (obj.isPhysicsObject()) {
		obj.body = this.world.CreateBody(obj.bodyDef);
	}
};

GithubVisualizer.prototype.update = function() {
	this.world.Step(1.0/60, 1);

	if (this.mouse.clicked) {
		this.drops[0].setInput((this.mouse.x - this.canvas.width/2) / 1000, (this.mouse.y - this.canvas.height/2) / 1000);
	}

	for (var i = 1; i < this.drops.length; i++) {
		this.drops[i].setInput(Math.random() - 0.5, Math.random() - 0.5)
	};

	for (var i = 0; i < this.drops.length; i++) {
		this.drops[i].update();
	};
};
 
GithubVisualizer.prototype.draw = function() {
	this.camera.draw();

	if (this.mouse.mouseover) {
		this.context.strokeStyle = "#0FF"
		this.context.beginPath();
		this.context.moveTo(this.canvas.width/2, this.canvas.height/2);
		this.context.lineTo(this.mouse.x, this.mouse.y);
		this.context.stroke();
	}
};

GithubVisualizer.prototype.run = function(){this.update();this.draw();window.requestAnimationFrame(this.run.bind(this));}
window.requestAnimationFrame = window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame;

var nextID = 0;

function GVObject () {
	this.context = null;
	this.body = null;
	this.bodyDef = null;
	this.pos = new Vector();
	this.id = nextID++;

	this.draw = function() {
		console.error("IMPLEMENT A DRAW FUNCTION");
	};

	this.addCamera = function(camera) {
		this.context = camera.context;
	};

	this.isPhysicsObject = function () {
		return (this.bodyDef) ? true : false;
	};
}
