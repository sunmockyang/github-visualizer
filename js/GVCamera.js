function GVCamera(context){
	this.context = context;
	this.width = 300;
	this.height = 300;

	this.center = new Vector(0,0);
	this.followObj = null;
	this.drawObjects = [];

	window.onresize = this.onresize.bind(this);
	this.onresize();
}

GVCamera.prototype.onresize = function() {
	this.width = this.context.canvas.width = window.innerWidth;

	this.height = this.context.canvas.height = window.innerHeight;

	this.draw();
};

GVCamera.prototype.followStrength = 0.04;

// Push type GVObject
GVCamera.prototype.addObject = function(obj) {
	obj.addCamera(this);
	this.drawObjects.push(obj);
};

GVCamera.prototype.setFollowObject = function(obj) {
	this.followObj = obj;
	this.center = obj.pos.clone();
};

GVCamera.prototype.lookAt = function(pos) {
	this.center.x = pos.x;
	this.center.y = pos.y;
}

GVCamera.prototype.draw = function() {
	this.context.clearRect(0, 0, this.width, this.height);

	var follow = (this.followObj != null) ? this.followObj.pos.clone() : this.center;
	follow = Vector.Lerp(this.center, follow, this.followStrength);
	this.center = follow;
	follow = follow.sub(new Vector(this.width/2, this.height/2));

	for (var i = 0; i < this.drawObjects.length; i++) {
		this.context.save();
		this.context.translate(this.drawObjects[i].pos.x - follow.x, this.drawObjects[i].pos.y - follow.y)
		this.drawObjects[i].draw();
		this.context.restore();
	};
};

GVCamera.prototype.convertWorldToCameraSpace = function(obj) {
	return obj.pos.sub(this.center).add(new Vector(this.width/2, this.height/2));
};

GVCamera.prototype.convertCameraToWorldSpace = function(x, y) {
	return this.center.add(new Vector(x, y).sub(new Vector(this.width/2, this.height/2)));
};
