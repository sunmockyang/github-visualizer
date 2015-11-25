function GVBall(x, y, mainRepo){
	this.size = 40 + Math.random() * 10;
	this.mainRepo = mainRepo;
	this.id = nextID++;

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(x, y);
	this.colour = "#f79520";
	this.randomMag = 1000;

	this.shape = new b2CircleDef();
	this.shape.density = 0.05;
	this.shape.radius = this.size * 0.1;
	this.shape.restitution = 0.1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);

	this.merged = false;

	this.anim = function() {};
}

GVBall.prototype = new GVObject();
GVBall.prototype.INPUT_STRENGTH = 2;
GVBall.prototype.FRICTION_STRENGTH = 0.9;
GVBall.prototype.MAX_SPEED = 5;

GVBall.prototype.getName = function() {
	return "Pull Request #" + this.id;
}

GVBall.prototype.merge = function() {
	this.merged = true;
	//this.colour = "#00FFBB";

	this.grad = this.context.createRadialGradient(0,0,0,0,0,this.size-20);
	this.grad.addColorStop(0, 'rgba(0,43,181,1)');
	this.grad.addColorStop(1, 'rgba(120,28,92,0)');


	setTimeout((function(){
			this.anim = function() {
			this.size = Math.max(0, this.size - 0.5);
		}
	}).bind(this), 2000);
	
};

GVBall.prototype.setInput = function(x, y) {
	this.accel.x = x;
	this.accel.y = y;

	this.accel = this.accel.multiply(this.INPUT_STRENGTH);
};

GVBall.prototype.update = function() {
	if (!this.grad) {
		this.grad = this.context.createRadialGradient(0,0,0,0,0,this.size);
	this.grad.addColorStop(0, 'rgba(0,43,181,1)');
	this.grad.addColorStop(1, 'rgba(120,28,92,0)');
	}

	this.anim();

	var randomForce = new Vector(Math.random() * this.randomMag - this.randomMag/2, Math.random() * this.randomMag - this.randomMag/2);
	this.body.ApplyForce(this.mainRepo.getGravityVector(this.pos, this.merged), this.body.GetCenterPosition());
	this.body.ApplyForce(randomForce, this.body.GetCenterPosition())
};

GVBall.prototype.draw = function() {

	this.context.drawSize = 0;
	this.context.drawSize = this.context.drawSize + 1;
	if(this.context.drawSize > this.size){
		this.context.drawSize = this.size;
	}

	
	this.context.fillStyle = this.grad;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};