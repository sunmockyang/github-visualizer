function GVCamera(context){
	this.context = context;
	this.width = 300;
	this.height = 300;

	this.center = new Vector(0,0);
	this.followObj = null;
	this.drawObjects = [];

	window.onresize = this.onresize.bind(this);
	this.onresize();
	this.setRandomColour();
}

GVCamera.prototype.setRandomColour = function() {
	this.textStyle = (["#ef3742", "#37ef42", "#3742ef"])[Math.floor(Math.random() * 3)];
};

GVCamera.prototype.onresize = function() {
	this.width = this.context.canvas.width = window.innerWidth;
	this.height = this.context.canvas.height = window.innerHeight;

	this.draw();
};

GVCamera.prototype.followStrength = 0.05;

// Push type GVObject
GVCamera.prototype.addObject = function(obj) {
	obj.addCamera(this);
	this.drawObjects.push(obj);
};

GVCamera.prototype.setFollowObject = function(obj, forceFollow) {
	this.followObj = obj;
	if (forceFollow) {
		this.center = obj.pos.clone();
	}
	this.setRandomColour();
};

GVCamera.prototype.lookAt = function(pos) {
	this.center.x = pos.x;
	this.center.y = pos.y;
}

GVCamera.prototype.draw = function() {
	// this.context.clearRect(0, 0, this.width, this.height);
	this.context.fillStyle = "#FFFF99";
	this.context.fillRect(0, 0, this.width, this.height);

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

	if (this.followObj) {
		this.context.font = "20px GothamSsm";
		this.context.fillStyle = this.textStyle;
		var text = (this.followObj.getName());

		var left = (this.width - this.context.measureText(text).width) / 2;

		this.context.fillText(text, left, this.height - 100);
	}
};

GVCamera.prototype.getBounds = function() {
	return new Bounds(this.center.x - this.width/2, this.center.y - this.height/2, this.width, this.height);
};

GVCamera.prototype.convertWorldToCameraSpace = function(obj) {
	return obj.pos.sub(this.center).add(new Vector(this.width/2, this.height/2));
};

GVCamera.prototype.convertCameraToWorldSpace = function(x, y) {
	return this.center.add(new Vector(x, y).sub(new Vector(this.width/2, this.height/2)));
};
