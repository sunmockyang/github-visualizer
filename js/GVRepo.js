function GVRepo(){
	this.size = 200;
	this.gravity = 50;
	this.repelDist = this.size + 150;
	this.repelStrength = this.gravity * 20;
	this.floatStrength = 50000000;
	this.name = "The Repository";

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(500, 500);
	this.colour = "#ef4237";

	this.shape = new b2CircleDef();
	this.shape.density = 1;
	this.shape.radius = this.size * .8;
	this.shape.restitution = 0.1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);
}

GVRepo.prototype = new GVObject();

GVRepo.prototype.getGravityVector = function(from, merged) {
	var force = new Vector();
	if (this.pos.sub(from).mag() > this.repelDist || merged){
		// force = this.pos.sub(from).normalize().multiply(this.gravity);
		force = this.pos.sub(from).multiply(this.gravity);
		if (merged){
			force = force.multiply(2);
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

	var xForce = 0;
	var yForce = 0;

	if (this.pos.x > GithubVisualizer.WORLD_BOUNDS.left + GithubVisualizer.WORLD_BOUNDS.width * 0.7) {
		xForce = -this.floatStrength;
	}
	else if (this.pos.x < GithubVisualizer.WORLD_BOUNDS.left + GithubVisualizer.WORLD_BOUNDS.width * 0.3) {
		xForce = this.floatStrength;
	}
	else {
		xForce = Math.random() * this.floatStrength - this.floatStrength/2;
	}

	if (this.pos.y > GithubVisualizer.WORLD_BOUNDS.top + GithubVisualizer.WORLD_BOUNDS.height * 0.7) {
		yForce = -this.floatStrength;
	}
	else if (this.pos.y < GithubVisualizer.WORLD_BOUNDS.top + GithubVisualizer.WORLD_BOUNDS.height * 0.3) {
		yForce = this.floatStrength;
	}
	else {
		yForce = Math.random() * this.floatStrength - this.floatStrength/2;
	}

	this.body.ApplyForce(new b2Vec2(xForce, yForce), this.body.GetCenterPosition());
};

GVRepo.prototype.draw = function() {
	
	var blobGradient = this.context.createRadialGradient(0,0,0.1,0,0,this.size);

			blobGradient.addColorStop(0, 'rgba(237,28,36,0.9)');
		blobGradient.addColorStop(1, 'rgba(218,28,92,0)');
	this.context.fillStyle = blobGradient;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};