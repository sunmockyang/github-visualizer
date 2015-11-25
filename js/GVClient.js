function GVClient (pullRequests, onPRCreate, onPRMerge) {
	this.onPRCreate = onPRCreate;	
	this.onPRMerge = onPRMerge;
	this.pullRequests = pullRequests;

	this.checkInterval = 100;
	this.createFrequency = 0.05;
	this.mergeFrequency = 0.05;

	for (var i = 0; i < 10; i++) {
		this.onPRCreate();
	};

	this.checkForChanges();

	document.onkeypress = this.keyPress.bind(this);
}

GVClient.prototype.keyPress = function(e) {
	e = e || window.event;
	var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
	if (charCode) {
		if (charCode == 32){
			this.onPRCreate();
		}
		else if (charCode == 13){
		this.onPRMerge(Math.floor(this.pullRequests.length * Math.random()));
		}
	}
};

GVClient.prototype.checkForChanges = function() {

	// setTimeout(this.checkForChanges.bind(this), this.checkInterval);
};