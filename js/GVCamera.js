function GVCamera(context, defaultFollowObj){
	this.context = context;
	this.width = 300;
	this.height = 300;

	this.center = new Vector(0,0);
	this.defaultFollowObj = defaultFollowObj;
	this.followObj = null;
	this.drawObjects = [];

	window.onresize = this.onresize.bind(this);
	this.onresize();
	this.setRandomColour();

	this.shadowColour = "rgba(0, 0, 0, 0.15)";
	this.shadowDistance = 4;
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
GVCamera.prototype.addObject = function(obj, front) {
	obj.addCamera(this);

	// by default add items to the front
	if (front !== true) {
		this.drawObjects.unshift(obj)
	}
	else {
		this.drawObjects.push(obj);
	}
};

GVCamera.prototype.removeObject = function(obj) {
	for (var i = 0; i < this.drawObjects.length; i++) {
		if (this.drawObjects[i] == obj) {
			this.drawObjects.splice(i, 1);
			break;
		}
	};
	if (obj == this.followObj){
		this.followObj = this.defaultFollowObj;
	}
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

	this.context.fillStyle = this.shadowColour;
	for (var i = 0; i < this.drawObjects.length; i++) {
		this.context.save();
		this.context.translate(this.drawObjects[i].pos.x - follow.x + this.shadowDistance, this.drawObjects[i].pos.y - follow.y + this.shadowDistance)
		this.drawObjects[i].drawShadow();
		this.context.restore();
	};

	for (var i = 0; i < this.drawObjects.length; i++) {
		this.context.fillStyle = this.shadowColour;
		this.context.save();
		this.context.translate(this.drawObjects[i].pos.x - follow.x, this.drawObjects[i].pos.y - follow.y)
		this.drawObjects[i].draw();
		this.context.restore();
	};

	if (this.followObj) {
		this.context.font = "20px GothamSsm";
		var text = (this.followObj.getName());

		var width = this.context.measureText(text).width;
		var left = (this.width - width) / 2;
		var top = this.height - 102;

		this.context.fillStyle = this.shadowColour;
		this.context.fillRect(left - 10 + this.shadowDistance, top - 10 + this.shadowDistance, width + 20, 40);

		this.context.fillStyle = "#FFF";
		this.context.fillRect(left - 10, top - 10, width + 20, 40);

		this.context.textBaseline = "hanging";
		this.context.fillStyle = this.followObj.colour;
		this.context.fillText(text, left, this.height - 100);
	}

	this.shadowDistance = (Math.sin((new Date()).getTime() / 10000) + 1) * 4 + 2;
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
