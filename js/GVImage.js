function GVImage(url){
	this.pos = new Vector(0, 0);
	this.readyToDraw = false;
	this.image = new Image();
	this.image.onload = (function() {this.readyToDraw = true; this.onload()}).bind(this);
	this.image.src = url;
	this.width = 0;
	this.height = 0;
}

GVImage.prototype = new GVObject();

GVImage.prototype.onload = function() {
	// Override this if you want
};

GVImage.prototype.getSize = function() {
	return {
		width: this.width || this.image.naturalWidth,
		height: this.height || this.image.naturalHeight
	}
};

// Will maintain aspect ratio if either width/height are missing
GVImage.prototype.setSize = function(size) {
	var imageSize = this.getSize()
	if (size.width !== undefined && size.height !== undefined) {
		this.width = size.width;
		this.height = size.height;
	}
	else if (size.width !== undefined) {
		this.height = size.width / imageSize.width * imageSize.height;
		this.width = size.width;
	}
	else if (size.height !== undefined) {
		this.width = size.height / imageSize.height * imageSize.width;
		this.height = size.height;
	}
};

GVImage.prototype.fitMaxBounds = function(bounds) {
	// Limit by height
	if (bounds.width/this.image.width > bounds.height/this.image.height){
		this.setSize({height:bounds.height})
	}
	else {
		this.setSize({width:bounds.width})
	}
};

GVImage.prototype.draw = function() {
	if (this.readyToDraw){
		if (this.width > 0 && this.height > 0) {
			this.context.drawImage(this.image, 0, 0, this.width, this.height);
		}
	}
};