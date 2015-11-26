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
	
	this.logo = new GVImage("img/youilogo.png");
	this.addObject(this.mainRepo);
	this.addObject(this.logo);

	this.drops = [];
	this.comments = [];
	this.particles = [];
	this.camera.setFollowObject(this.mainRepo, true);

	this.client = new GVClient(this.drops, this.createPR.bind(this), this.mergePR.bind(this), this.comment.bind(this));

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


	// var groundSd = new b2BoxDef();
	// groundSd.extents.Set(1000, 50);
	// groundSd.restitution = 0.2;
	// var groundBd = new b2BodyDef();
	// groundBd.AddShape(groundSd);
	// groundBd.position.Set(0, 700);
	// world.CreateBody(groundBd);

	return world;
};

GithubVisualizer.prototype.comment = function(i) {
	for (var i = 0; i < 100; i++) {
		var distFromEdge = -200;
		var screenBounds = this.camera.getBounds();
		var x = (Math.random() > 0.5) ? screenBounds.left : (screenBounds.left + screenBounds.width - distFromEdge);
		var y = (Math.random() > 0.5) ? screenBounds.top : (screenBounds.top + screenBounds.height - distFromEdge);
		var boid = new GVBoid(x, y, this.drops[Math.floor(Math.random() * this.drops.length)], this.comments);
		this.comments.push(boid);
		this.addObject(boid);

		this.camera.setFollowObject(boid);
	};
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

	this.camera.setFollowObject(ball);
	this.camera.followStrength = 0.08;
}

GithubVisualizer.prototype.mergePR = function(i) {
	if (this.drops.length > i)
	{
		this.camera.setFollowObject(this.drops[i]);
		this.drops[i].merge();
	}
};

GithubVisualizer.prototype.setRandomCameraFollow = function() {
	var drop = this.drops[Math.floor(Math.random() * this.drops.length)];

	if (!this.camera.followObj || this.camera.followObj != this.mainRepo || this.drops.length == 0 || drop.size < 1) {
		this.camera.setFollowObject(this.mainRepo);
		this.camera.followStrength = 0.07;
	}
	else {
		this.camera.setFollowObject(drop);
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

	for (var i = 0; i < this.particles.length; i++) {
		this.particles[i].update();
		// Delete particles
		if (this.particles[i].size <= 0.5) {

			this.camera.removeObject(this.particles[i]);
			this.particles.splice(i, 1);
		}
	};

	for (var i = 0; i < this.comments.length; i++) {
		this.comments[i].update();
		// Delete comments
		if (this.comments[i].size <= 0.1) {
			this.camera.removeObject(this.comments[i]);
			this.comments.splice(i, 1);
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

GithubVisualizer.prototype.onMouseClick = function() {
	var worldSpace = this.camera.convertCameraToWorldSpace(this.mouse.x, this.mouse.y);
	this.createPR();
};

var nextID = 32;

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
