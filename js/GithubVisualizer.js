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
	this.mainRepo = new GVRepo();
	this.camera = new GVCamera(this.context, this.mainRepo);
	this.addObject(this.mainRepo);
	

	this.drops = [];
	this.boids = [];
	this.particles = [];
	this.camera.setFollowObject(this.mainRepo, true);

	this.client = new GVClient(this.drops, this.boids, this.setMainBallAttr.bind(this), this.createBall.bind(this), this.mergeBall.bind(this), this.setBallAttributes.bind(this), this.createBoid.bind(this));

	this.logo = new GVImage(this.client.imageURL);
	this.addObject(this.logo);

	this.camera.setFollowObject(this.mainRepo, true);

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

	return world;
};

GithubVisualizer.prototype.setMainBallAttr = function(attr) {
	this.mainRepo.setAttributes(attr);
};

GithubVisualizer.prototype.createBoid = function(ballID, attr) {
	var distFromEdge = -200;
	var screenBounds = this.camera.getBounds();
	var x = (Math.random() > 0.5) ? screenBounds.left : (screenBounds.left + screenBounds.width - distFromEdge);
	var y = (Math.random() > 0.5) ? screenBounds.top : (screenBounds.top + screenBounds.height - distFromEdge);
	var boid = new GVBoid(x, y, this.findBallByID(ballID), this.boids, attr);
	this.boids.push(boid);
	this.addObject(boid);

	this.camera.setFollowObject(boid);
};

GithubVisualizer.prototype.createBall = function(attr) {
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

	var ball = new GVBall(this.world, x, y, this.mainRepo, attr);
	this.drops.push(ball);
	this.addObject(ball);

	this.camera.setFollowObject(ball);
	this.camera.followStrength = 0.08;

	return ball;
}

GithubVisualizer.prototype.setBallAttributes = function(id, attr) {
	var ball = this.findBallByID(id);

	if (ball){
		ball.setAttributes(attr);
	}
};

GithubVisualizer.prototype.mergeBall = function(id) {
	var ball = this.findBallByID(id);
	if (ball)
	{
		this.camera.setFollowObject(ball);
		ball.merge();
	}
};

GithubVisualizer.prototype.findBallByID = function(id) {
	// Find ball
	var ball = null;
	for (var i = 0; i < this.drops.length; i++) {
		if (this.drops[i].id == id){
			ball = this.drops[i];
		}
	};
	return ball;
};

GithubVisualizer.prototype.setRandomCameraFollow = function() {
	var drop = this.drops[Math.floor(Math.random() * this.drops.length)];
	var boid = this.boids[Math.floor(Math.random() * this.boids.length)];

	if (!this.camera.followObj || this.camera.followObj != this.mainRepo ||
		this.drops.length == 0 || drop.size < 1 ||
		this.boids.length == 0 || (boid.follow && boid.follow.size < 1)) {
		this.camera.setFollowObject(this.mainRepo);
		this.camera.followStrength = 0.07;
	}
	else if (Math.random() > 0.5) {
		this.camera.setFollowObject(drop);
		this.camera.followStrength = 0.08;
	}
	else {
		this.camera.setFollowObject(boid);
		this.camera.followStrength = 0.08;
	}
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
		if (this.drops[i].size <= 0) {
			if (this.camera.followObj == this.drops[i]) {
				this.setRandomCameraFollow();
			}
			var x = this.drops[i].pos.x;
			var y = this.drops[i].pos.y;
			for (var j = 0; j < this.numParticlesInExplosion; j++) {
				this.particles.push(new GVParticle(x, y, 1));
				this.camera.addObject(this.particles[this.particles.length - 1]);
			};
			this.world.DestroyBody(this.drops[i].body);
			this.drops.splice(i, 1);
		}
	};

	this.world.Step(1.0/60, 1);

	this.mainRepo.postUpdate();

	for (var i = 0; i < this.drops.length; i++) {
		this.drops[i].postUpdate();
	};

	for (var i = 0; i < this.particles.length; i++) {
		this.particles[i].update();
		// Delete particles
		if (this.particles[i].size <= 0.5) {

			this.camera.removeObject(this.particles[i]);
			this.particles.splice(i, 1);
		}
	};

	for (var i = 0; i < this.boids.length; i++) {
		this.boids[i].update();
		// Delete boids
		if (this.boids[i].size <= 0.1) {
			this.camera.removeObject(this.boids[i]);
			this.boids.splice(i, 1);
		}
	};

	this.logo.pos.x = this.mainRepo.pos.x - this.logo.getSize().width/2;
	this.logo.pos.y = this.mainRepo.pos.y - this.logo.getSize().height/2;

	if (Math.random() < 0.001 || !this.camera.followObj) {
		this.setRandomCameraFollow();
	}
};
 
GithubVisualizer.prototype.draw = function() {
	this.camera.draw();
};

GithubVisualizer.prototype.run = function(){this.update();this.draw();window.requestAnimationFrame(this.run.bind(this));}
window.requestAnimationFrame = window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame;

// Event handlers
GithubVisualizer.prototype.onMouseMove = function() {};

GithubVisualizer.prototype.onMouseClick = function() {};

function GVObject () {
	this.context = null;
	this.body = null;
	this.bodyDef = null;
	this.pos = new Vector();
	this.name = "random object";
	this.colour = "#000000";

	this.getName = function() {
		return this.name;
	}
	
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

	this.drawShadow = function () {};

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
