var ParticleIndex = 0;

function GVParticle(x, y, type, color) {
	this.pos = new Vector(x, y);
	this.birthOrDeath = type;

	this.speeds = [[0,-12],[9,-9],[12,0],[9,9],[0,12],[-9,9],[-12,0],[-9,-9]];
	this.size = 4;
	this.speed = new Vector(this.speeds[ParticleIndex][0],this.speeds[ParticleIndex][1]);
	
	this.accel = new Vector(this.speeds[ParticleIndex][0] * -1, this.speeds[ParticleIndex][1] * -1);

	//console.log (this.speed.x + " + " + this.accel.x + " = " + this.speed.add(this.accel).x);

	ParticleIndex = (ParticleIndex + 1) % this.speeds.length;
	//this.accel = new Vector(0,0);
	this.color = (color) ? color : '#ef4237';
}

GVParticle.prototype = new GVObject();
GVParticle.prototype.FRICTION_STRENGTH = 0.9;
GVParticle.prototype.MAX_SPEED = 50;

GVParticle.prototype.update = function() {

	//this.speed = this.speed.add(this.accel);
	this.speed = this.speed.multiply(this.FRICTION_STRENGTH);
	this.speed.clamp(this.MAX_SPEED, -this.MAX_SPEED);
	this.pos = this.pos.add(this.speed);
	this.size = this.size * 0.95;
	// this.color = ("hls(" + )
	//this.accel = Vector.Zero();

	//this.size = Mathx.Lerp(this.size, 5 + this.speed.mag() * 5, 0.1);
};

GVParticle.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();

	this.context.strokeStyle=this.color;
    this.context.lineWidth=4;
    this.context.translate(0,0);
    this.context.moveTo(0,0);
	this.context.rotate(Math.atan2(this.speed.y, this.speed.x) + Math.PI/2);
    this.context.lineTo(0, this.size * 10);
    //console.log(this.speed.x, this.speed.y);
	this.context.stroke();
	//this.context.arc(0, 0, this.size, 0, 2 * Math.PI, false);
	//this.context.fill();
	this.context.closePath();

};