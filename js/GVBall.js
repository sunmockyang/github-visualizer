// Optional set by input - id, status, colour, size

function GVBall(world, x, y, mainRepo, id, status, colour, size){
	this.size = 0;
	this.mainRepo = mainRepo;
	this.id = (id) ? id : 0;
	this.status = (status) ? status : "open";
	this.world = world;

	this.accel = new Vector(0, 0);
	this.speed = new Vector(0,0);
	this.pos = new Vector(x, y);
	this.colour = (colour) ? colour : "#f79520";
	this.randomMag = 1000;

	this.shape = new b2CircleDef();
	this.shape.density = 0.05;
	this.shape.radius = (size) ? size : 20 + Math.random() * 10;
	this.shape.restitution = 0.1;
	this.shape.friction = 10;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.AddShape(this.shape);
	this.bodyDef.position.Set(this.pos.x,this.pos.y);

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
	this.colour = "#00DD99";

	setTimeout((function(){
			this.anim = function() {
			this.size = Math.max(0, this.size - 0.5);
		}
	}).bind(this), 2000);

	this.status = "merged";
};

GVBall.prototype.setAttributes = function(attr) {
	this.id = (attr.id) ? attr.id : this.id;
	this.status = (attr.status) ? attr.status : this.status;
	this.colour = (attr.colour) ? attr.colour : this.colour;

	if (attr.size) {
		this.size = attr.size;
		this.shape = new b2CircleDef();
		this.shape.density = 0.05;
		this.shape.radius = this.size;
		this.shape.restitution = 0.1;
		this.shape.friction = 10;

		this.bodyDef = new b2BodyDef();
		this.bodyDef.AddShape(this.shape);
		this.bodyDef.position.Set(this.pos.x,this.pos.y);

		this.world.DestroyBody(this.body);
		this.body = this.world.CreateBody(this.bodyDef);
	}
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
		var text = "#" + this.id;
		var width = this.context.measureText(text).width;
		var left = (this.pos.x - width) / 2 + this.pos.x;
		var top = this.pos.y - 12;
		this.context.textBaseline = "hanging";
		this.context.fillStyle = "#FFFFFF";
		this.context.fillText(text, -width/2, -this.size/5);
	}
};

GVBall.prototype.drawShadow = function() {
	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};