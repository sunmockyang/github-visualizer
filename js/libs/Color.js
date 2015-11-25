function Color(r, g, b, a){
	this.setRGBA(r, g, b, a);
}

Color.prototype.setHex = function(hex) {
	if(hex.substring(0,1) == "#"){
		if(hex.length == 4){
			this.r = parseInt(hex.substring(1,2) + hex.substring(1,2), 16);
			this.g = parseInt(hex.substring(2,3) + hex.substring(2,3), 16);
			this.b = parseInt(hex.substring(3,4) + hex.substring(3,4), 16);
		}
		else if(hex.length == 7){
			this.r = parseInt(hex.substring(1,3), 16);
			this.g = parseInt(hex.substring(3,5), 16);
			this.b = parseInt(hex.substring(5,7), 16);
		}
	}
};

Color.prototype.setRGB = function(r, g, b){
	this.r = (r) ? Math.floor(r) : 0;
	this.g = (g) ? Math.floor(g) : 0;
	this.b = (b) ? Math.floor(b) : 0;
	this.a = 1;
	return this;
};

Color.prototype.setRGBA = function(r, g, b, a){
	this.r = (r) ? Math.floor(r) : 0;
	this.g = (g) ? Math.floor(g) : 0;
	this.b = (b) ? Math.floor(b) : 0;
	this.a = (a) ? a : 0;
	return this;
};

Color.prototype.toHex = function() {
	function hexConvert(dec){
		var hex = dec.toString(16);
		return (dec < 16) ? "0" + hex : hex;
	}

	return "#" + hexConvert(this.r) + hexConvert(this.g) + hexConvert(this.b);
};

Color.prototype.toRGB = function() {
	return "rgb(" + [this.r, this,g, this.b].join() + ")";
};

Color.prototype.toRGBA = function() {
	return "rgba(" + [this.r, this,g, this.b, this.a].join() + ")";
};
