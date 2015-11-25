var ParticleIndex = 0;

function GVParticle(x, y, type) {
	this.pos = new Vector(x, y);
	this.birthOrDeath = type;

	this.speeds = [[0,-10],[7,-7],[10,0],[7,7],[0,10],[-7,7],[-10,0],[-7,-7]];
	this.size = 4;
	this.speed = new Vector(this.speeds[ParticleIndex][0],this.speeds[ParticleIndex][1]);
	
	this.accel = new Vector(this.speeds[ParticleIndex][0] * -1, this.speeds[ParticleIndex][1] * -1);

	//console.log (this.speed.x + " + " + this.accel.x + " = " + this.speed.add(this.accel).x);

	ParticleIndex = (ParticleIndex + 1) % this.speeds.length;
	//this.accel = new Vector(0,0);
	this.color = '#ef4237';
}

GVParticle.prototype = new GVObject();
GVParticle.prototype.FRICTION_STRENGTH = 0.9;
GVParticle.prototype.MAX_SPEED = 50;

GVParticle.prototype.update = function() {

	//this.speed = this.speed.add(this.accel);
	this.speed = this.speed.multiply(this.FRICTION_STRENGTH);
	this.speed.clamp(this.MAX_SPEED, -this.MAX_SPEED);
	this.pos = this.pos.add(this.speed);
	this.size = this.size * 0.8;
	// this.color = ("hls(" + )
	//this.accel = Vector.Zero();

	//this.size = Mathx.Lerp(this.size, 5 + this.speed.mag() * 5, 0.1);
};

GVParticle.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();

	this.context.strokeStyle='#ef4237';
    this.context.lineWidth=2;
    this.context.translate(0,0);
    this.context.moveTo(0,0);
    this.context.lineTo(this.speed.x, this.speed.y);
    //console.log(this.speed.x, this.speed.y);
	this.context.stroke();
	//this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	//this.context.fill();
	this.context.closePath();

};