// Optional set by input - id, status, colour, size

function GVBall(world, x, y, mainRepo, attr) {
	this.type = GVBall;
	this.size = 0;
	this.mainRepo = mainRepo;
	this.id = "0";
	this.name = "0";
	this.status = "open";
	this.url = "";
	this.world = world;
	this.repo = {"owner": "", "name": ""};
	this.boids = [];

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(x, y);
	this.colour = "#f79520";
	this.randomMag = 1000;

	this.shape = new b2CircleDef();
	this.shape.density = 0.05;
	this.shape.radius = (attr.size) ? attr.size : 20 + Math.random() * 10;
	this.shape.restitution = 0.1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);

	this.setAttributes(attr);

	this.merged = false;

	this.anim = function() {
		this.size = Mathx.Lerp(this.size, this.shape.radius, 0.02);
		if (this.shape.radius - this.size < 0.05){
			this.size = this.shape.radius;
			this.anim = function() {};
		}
	};
}

GVBall.prototype = new GVObject();
GVBall.prototype.INPUT_STRENGTH = 2;
GVBall.prototype.FRICTION_STRENGTH = 0.9;
GVBall.prototype.MAX_SPEED = 400;
GVBall.prototype.DRAW_TEXT = true;

GVBall.prototype.merge = function() {
	this.merged = true;
	this.colour = this.mainRepo.colour;

	setTimeout((function(){
			this.anim = function() {
			this.size = Math.max(0, this.size - 0.5);
		}
	}).bind(this), 2000);

	this.status = "merged";
};

GVBall.prototype.setAttributes = function(attr) {
	this.id = (attr.id) ? attr.id : this.id;
	this.name = (attr.name) ? attr.name : this.name;
	this.status = (attr.status) ? attr.status : this.status;
	this.colour = (attr.colour) ? attr.colour : this.colour;
	this.repo = (attr.repo) ? attr.repo : this.repo
	this.url = (attr.url) ? attr.url : this.url;

	if (attr.size && attr.size != this.size) {
		this.size = attr.size;
		this.shape = new b2CircleDef();
		this.shape.density = 0.05;
		this.shape.radius = attr.size;
		this.shape.restitution = 0.1;
		this.shape.friction = 10;

		this.bodyDef = new b2BodyDef();
		this.bodyDef.AddShape(this.shape);
		this.bodyDef.position.Set(this.pos.x,this.pos.y);
		var velocity = this.body.GetLinearVelocity();

		this.world.DestroyBody(this.body);
		this.body = this.world.CreateBody(this.bodyDef);
		this.body.SetLinearVelocity(velocity);
	}
};

GVBall.prototype.addFollower = function(follower) {
	this.boids.push(follower);
};

GVBall.prototype.calculateSize = function() {
	// Get average age of last few commits, size accordingly
	var boidLimit = 5;
	var boidAge = 0;

	var minAge = 1000 * 60 * 30; // 30 minutes
	var maxAge = 1000 * 60 * 60 * 24 * 7; // 1 week

	this.boids.sort(function (a, b) {
		return a.timeCreated - b.timeCreated;
	});

	var i = 0;
	for (; i < boidLimit; i++) {
		if (i < this.boids.length) {
			boidAge += Date.now() - this.boids[i].timeCreated;
		}
		else {
			boidAge += (maxAge - minAge) / 2 + minAge;
		}
	};
	boidAge /= boidLimit;

	boidAge = Mathx.clamp(boidAge, minAge, maxAge);
	boidAge = 1 - (boidAge - minAge) / (maxAge - minAge); // convert to percent (0 - 1)
	var size = boidAge * 20 + 15;

	this.setAttributes({size: size});
};

GVBall.prototype.setInput = function(x, y) {
	this.accel.x = x;
	this.accel.y = y;

	this.accel = this.accel.multiply(this.INPUT_STRENGTH);
};

GVBall.prototype.update = function() {
	this.anim();

	var velocity = this.body.GetLinearVelocity();
	var speed = velocity.Length();
	if (speed > this.MAX_SPEED){
		velocity.Multiply(this.MAX_SPEED / speed)
		this.body.SetLinearVelocity(velocity);
	}

	var randomForce = new Vector(Math.random() * this.randomMag - this.randomMag/2, Math.random() * this.randomMag - this.randomMag/2);
	this.body.ApplyForce(this.mainRepo.getGravityVector(this.pos, this.merged), this.body.GetCenterPosition());
	this.body.ApplyForce(randomForce, this.body.GetCenterPosition())
};

GVBall.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();

	if (this.DRAW_TEXT){
		this.context.font = Math.floor(this.size/2.2) + "px GothamSsm";
		var text = "#" + this.name;
		var width = this.context.measureText(text).width;
		var left = (this.pos.x - width) / 2 + this.pos.x;
		var top = this.pos.y - 12;
		this.context.textBaseline = "hanging";
		this.context.fillStyle = (this.colour == "#FFFFFF") ? "#000000" : "#FFFFFF";
		this.context.fillText(text, -width/2, -this.size/5);
	}
};

GVBall.prototype.drawShadow = function() {
	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};