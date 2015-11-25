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
	this.logo = new GVImage("img/youilogo.png");

	this.mainRepo = new GVRepo();
	this.addObject(this.mainRepo);

	this.camera.setFollowObject(this.mainRepo);

	this.drops = [];
	this.particles = [];

	this.client = new GVClient(this.drops, this.createPR.bind(this), this.mergePR.bind(this));

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

GithubVisualizer.prototype.numParticlesInExplosion = 8;
GithubVisualizer.WORLD_BOUNDS = new Bounds(-10000, -10000, 20000, 20000);

GithubVisualizer.prototype.setupPhysics = function() {
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(GithubVisualizer.WORLD_BOUNDS.left, GithubVisualizer.WORLD_BOUNDS.top);
	worldAABB.maxVertex.Set(GithubVisualizer.WORLD_BOUNDS.left + GithubVisualizer.WORLD_BOUNDS.width,
							GithubVisualizer.WORLD_BOUNDS.top + GithubVisualizer.WORLD_BOUNDS.height);
	var gravity = new b2Vec2(0, 0);
	var doSleep = false;
	var world = new b2World(worldAABB, gravity, doSleep);


	// var groundSd = new b2BoxDef();
	// groundSd.extents.Set(1000, 50);
	// groundSd.restitution = 0.2;
	// var groundBd = new b2BodyDef();
	// groundBd.AddShape(groundSd);
	// groundBd.position.Set(0, 700);
	// world.CreateBody(groundBd);

	return world;
};

GithubVisualizer.prototype.createPR = function() {
	var distFromEdge = 200;
	var screenBounds = this.camera.getBounds();
	var x = (Math.random() > 0.5) ? screenBounds.left : (screenBounds.left + screenBounds.width - distFromEdge);
	var y = (Math.random() > 0.5) ? screenBounds.top : (screenBounds.top + screenBounds.height - distFromEdge);

	x += Math.random() * distFromEdge;
	y+= Math.random() * distFromEdge;
	for (var i = 0; i < this.numParticlesInExplosion; i++) {
		this.particles.push(new GVParticle(x, y, 1));
		this.camera.addObject(this.particles[this.particles.length - 1]);
	};

	var ball = new GVBall(x, y, this.mainRepo);
	this.drops.push(ball);
	this.addObject(ball);
}

GithubVisualizer.prototype.mergePR = function(i) {
	this.drops[i].merge();
};

GithubVisualizer.prototype.addObject = function(obj) {
	this.camera.addObject(obj);

	if (obj.isPhysicsObject()) {
		obj.body = this.world.CreateBody(obj.bodyDef);
	}
};

GithubVisualizer.prototype.update = function() {
	this.mainRepo.update();

	for (var i = 0; i < this.drops.length; i++) {
		this.drops[i].update();
	};

	this.world.Step(1.0/60, 1);

	// if (this.mouse.clicked) {
	// 	this.drops[0].setInput((this.mouse.x - this.canvas.width/2) / 1000, (this.mouse.y - this.canvas.height/2) / 1000);
	// }

	// for (var i = 1; i < this.drops.length; i++) {
	// 	this.drops[i].setInput(Math.random() - 0.5, Math.random() - 0.5)
	// };
	
	this.mainRepo.postUpdate();

	for (var i = 0; i < this.drops.length; i++) {
		this.drops[i].postUpdate();
		if (this.drops[i].size <= 0) {
			this.world.DestroyBody(this.drops[i].body);
			this.drops.splice(i, 1);
		}
	};

	for (var i = 0; i < this.particles.length; i++) {
		this.particles[i].update();
		// Delete particles
		if (this.particles[i].size <= 0) {
			this.particles.splice(i, 1);
		}
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

// Event handlers
GithubVisualizer.prototype.onMouseMove = function() {};

GithubVisualizer.prototype.onMouseClick = function() {
	var worldSpace = this.camera.convertCameraToWorldSpace(this.mouse.x, this.mouse.y);
	this.createPR();
};

var nextID = 0;

function GVObject () {
	this.context = null;
	this.body = null;
	this.bodyDef = null;
	this.pos = new Vector();
	this.id = nextID++;
	
	this.setPos = function(x, y) {
		this.pos.x = x;
		this.pos.y = y;

		if (this.isPhysicsObject()) {
			this.body.SetCenterPosition(new b2Vec2(x, y));
			this.body.WakeUp()
		}
	}

	this.draw = function() {
		console.error("IMPLEMENT A DRAW FUNCTION");
	};

	this.addCamera = function(camera) {
		this.context = camera.context;
	};

	this.isPhysicsObject = function () {
		return (this.bodyDef) ? true : false;
	};

	this.postUpdate = function () {
		if (this.isPhysicsObject()) {
			this.pos.x = this.body.GetCenterPosition().x;
			this.pos.y = this.body.GetCenterPosition().y;
		}
	};
}
