function GVRepo(){
	this.size = 200;
	this.gravity = 1000;

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(500, 500);
	this.colour = (new Color(255, 255, 50)).toHex();

	this.shape = new b2CircleDef();
	this.shape.density = 0;
	this.shape.radius = this.size;
	this.shape.restitution = 1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);
}

GVRepo.prototype = new GVObject();

GVRepo.prototype.getGravityVector = function(from) {
  	return this.pos.sub(from).multiply(this.gravity);
};

GVRepo.prototype.setInput = function(x, y) {
	this.accel.x = x;
	this.accel.y = y;

	this.accel = this.accel.multiply(this.INPUT_STRENGTH);
};

GVRepo.prototype.update = function() {
};

GVRepo.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};