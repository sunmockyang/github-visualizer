function GVRepo(){
	this.type = GVRepo;
	this.size = 200;
	this.gravity = 100;
	this.repelDist = this.size + 175;
	this.repelStrength = this.gravity * 30;
	this.floatStrength = 50000000;
	this.owner = GVConfig.owner || "My";
	this.name = GVConfig.repository || "Awesome";

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(500, 500);
	this.colour = GVConfig.repo_colour || "#ef4237";

	this.shape = new b2CircleDef();
	this.shape.density = 1;
	this.shape.radius = this.size;
	this.shape.restitution = 0.1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);
}

GVRepo.prototype = new GVObject();
GVRepo.prototype.MAX_SPEED = 200;

GVRepo.prototype.setAttributes = function(attr) {
	this.colour = (attr.colour) ? attr.colour : this.colour;
	this.name = (attr.name) ? attr.name : this.name;
};

GVRepo.prototype.getGravityVector = function(from, merged) {
	var force = new Vector();
	var delta = this.pos.sub(from);
	if (delta.mag() > this.repelDist || merged){
		force = delta.multiply(this.gravity);
		if (merged){
			force = force.multiply(5);
		}
	}
	else {
		force = this.pos.sub(from).normalize().multiply(-this.repelStrength);
	}
  	return force;
};

GVRepo.prototype.update = function() {
	// this.setInput(Math.random() - 0.5, Math.random() - 0.5);

	// this.speed = this.speed.add(this.accel);
	// this.speed.clamp(this.MAX_SPEED, -this.MAX_SPEED);
	// this.pos = this.pos.add(this.speed);

	// // friction
	// this.speed = this.speed.multiply(this.FRICTION_STRENGTH);
	// this.accel = Vector.Zero();

	// this.setPos(this.pos.x, this.pos.y);
	var velocity = this.body.GetLinearVelocity();
	var speed = velocity.Length();
	if (speed > this.MAX_SPEED){
		velocity.Multiply(this.MAX_SPEED / speed)
		this.body.SetLinearVelocity(velocity);
	}

	var xForce = 0;
	var yForce = 0;

	if (this.pos.x > GithubVisualizer.WORLD_BOUNDS.left + GithubVisualizer.WORLD_BOUNDS.width * 0.7) {
		xForce = -this.floatStrength / 2;
	}
	else if (this.pos.x < GithubVisualizer.WORLD_BOUNDS.left + GithubVisualizer.WORLD_BOUNDS.width * 0.3) {
		xForce = this.floatStrength /2;
	}
	else {
		xForce = Math.random() * this.floatStrength - this.floatStrength/2;
	}

	if (this.pos.y > GithubVisualizer.WORLD_BOUNDS.top + GithubVisualizer.WORLD_BOUNDS.height * 0.7) {
		yForce = -this.floatStrength / 2;
	}
	else if (this.pos.y < GithubVisualizer.WORLD_BOUNDS.top + GithubVisualizer.WORLD_BOUNDS.height * 0.3) {
		yForce = this.floatStrength / 2;
	}
	else {
		yForce = Math.random() * this.floatStrength - this.floatStrength/2;
	}

	this.body.ApplyForce(new b2Vec2(xForce, yForce), this.body.GetCenterPosition());
};

GVRepo.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};

GVRepo.prototype.drawShadow = function() {
	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};