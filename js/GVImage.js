function GVImage(url){
	this.pos = new Vector(0, 0);
	this.readyToDraw = false;
	this.image = new Image();
	this.image.onload = (function() {this.readyToDraw = true;}).bind(this);
	this.image.src = url;
}

GVImage.prototype = new GVObject();

GVImage.prototype.draw = function() {
	if (this.readyToDraw){
		this.context.drawImage(this.image, 0, 0);
	}
};