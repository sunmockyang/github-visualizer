var ParticleIndex = 0;

function GVParticle(x, y, type) {
	this.pos = new Vector(x, y);
	this.birthOrDeath = type;

	this.speeds = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
	this.size = 4;
	this.speed = new Vector(this.speeds[ParticleIndex][0],this.speeds[ParticleIndex][1]);
	ParticleIndex = (ParticleIndex + 1) % this.speeds.length;
	//this.accel = new Vector(Math.random() - 0.5, Math.random()-0.5);
	this.accel = new Vector(0,0);
	this.color = '#f7941e';
}

GVParticle.prototype = new GVObject();
GVParticle.prototype.FRICTION_STRENGTH = 0.9;
GVParticle.prototype.MAX_SPEED = 5;

GVParticle.prototype.update = function() {

	this.speed = this.speed.add(this.accel);
	this.speed.clamp(this.MAX_SPEED, -this.MAX_SPEED);
	this.pos = this.pos.add(this.speed);
	this.size = this.size * 0.999;
	//this.accel = Vector.Zero();

	//this.size = Mathx.Lerp(this.size, 5 + this.speed.mag() * 5, 0.1);
};

GVParticle.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();
	this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	this.context.fill();
	this.context.closePath();
};