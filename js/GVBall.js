function GVBall(x, y, mainRepo){
	this.size = 40 + Math.random() * 10;
	this.mainRepo = mainRepo;

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(x, y);
	this.colour = "#f79520";
	this.randomMag = 1000;

	this.shape = new b2CircleDef();
	this.shape.density = 0.05;
	this.shape.radius = this.size;
	this.shape.restitution = 0.1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);
}

GVBall.prototype = new GVObject();
GVBall.prototype.INPUT_STRENGTH = 2;
GVBall.prototype.FRICTION_STRENGTH = 0.9;
GVBall.prototype.MAX_SPEED = 5;

GVBall.prototype.setInput = function(x, y) {
	this.accel.x = x;
	this.accel.y = y;

	this.accel = this.accel.multiply(this.INPUT_STRENGTH);
};

GVBall.prototype.update = function() {
	var randomForce = new Vector(Math.random() * this.randomMag - this.randomMag/2, Math.random() * this.randomMag - this.randomMag/2);
	this.body.ApplyForce(this.mainRepo.getGravityVector(this.pos), this.body.GetCenterPosition());
	this.body.ApplyForce(randomForce, this.body.GetCenterPosition())
};

GVBall.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};