function GVBoid(x, y, follow, colour, name, others) {
	this.size = 10;
	this.others = others;
	this.follow = follow;
	this.attractDist = 20;
	this.otherRepelDist = 20;
	this.otherAttractDist = 40;
	this.otherAverageDist = 20;
	this.colour = (colour) ? colour : '#559999';
	this.rotate = 0;
	this.name = (name) ? name : "Comment";

	this.pos = new Vector(x, y);
	this.speed = new Vector(Math.random() * 20 - 10, Math.random() * 20 - 10);
	this.accel = new Vector(0, 0);
	this.dead = false;
}

GVBoid.prototype = new GVObject();
GVBoid.prototype.FRICTION_STRENGTH = 0.95;
GVBoid.prototype.MAX_SPEED = 200;

GVBoid.prototype.update = function() {
	if (this.follow && this.follow.size > 0.05){
		function sqrt(e) {
			if (e < 0) {
				return -Math.sqrt(Math.abs(e));
			}
			return Math.sqrt(e);
		}
		var delta = this.follow.pos.sub(this.pos);
		
		if (delta.mag() > this.follow.size + this.attractDist){
			this.accel = Vector.Lerp(this.accel, delta.apply(sqrt).multiply(2), 0.01);
		}
		else {
			this.accel = this.speed.normalize().multiply(0.2);
		}

		var swarm = new Vector();
		var average = new Vector();
		for (var i = 0; i < this.others.length; i++) {
			if (this.others[i] != this){
				var delta = this.pos.sub(this.others[i].pos);
				if(delta.mag() < this.otherRepelDist){
					swarm = swarm.add(delta.normalize().multiply(0.01));
				}
				else if(delta.mag() < this.otherAttractDist){
					swarm = swarm.sub(delta.normalize().multiply(0.001));
				}

				if (delta.mag() < this.otherAverageDist) {
					average = average.add(this.others[i].speed);
				}
			}
		};
		average = average.divide(this.others.length).multiply(0.01);

		this.accel = this.accel.add(swarm).add(average);
	}
	else {
		this.follow = null;
		if (!this.dead){
			this.dead = true;
			setTimeout((function() {
				this.size = 0;
			}).bind(this), 2000);
		}
		var average = new Vector();
		var swarm = new Vector();
		for (var i = 0; i < this.others.length; i++) {
			if (this.others[i] != this){
				var delta = this.pos.sub(this.others[i].pos);
				swarm = swarm.add(delta);
			}
		};
		this.accel = this.accel.add(swarm.normalize());
	}

	var randomTurn = Math.PI / 4 * (Math.random() - 0.5);
	this.accel = this.accel.rotate(randomTurn);


	this.speed = this.speed.add(this.accel);
	this.speed.clamp(this.MAX_SPEED, -this.MAX_SPEED);
	this.pos = this.pos.add(this.speed);
	this.rotate = Mathx.Lerp(this.rotate, Math.atan2(-this.speed.y, -this.speed.x) + Math.PI/2, 0.1);

	// friction
	this.speed = this.speed.multiply(this.FRICTION_STRENGTH);
	this.accel = Vector.Zero();
};

GVBoid.prototype.draw = function() {
	this.context.fillStyle = this.colour;

	this.context.beginPath();

	this.context.rotate(this.rotate);

	this.context.lineTo(-this.size/3, 0);
	this.context.lineTo(0, this.size);
	this.context.lineTo(this.size/3, 0);

	this.context.fill();
	this.context.closePath();

};

GVBoid.prototype.drawShadow = function() {
	this.context.beginPath();

	this.context.rotate(this.rotate);

	this.context.lineTo(-this.size/3, 0);
	this.context.lineTo(0, this.size);
	this.context.lineTo(this.size/3, 0);

	this.context.fill();
	this.context.closePath();

};
