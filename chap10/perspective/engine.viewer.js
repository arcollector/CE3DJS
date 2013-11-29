Engine.Viewer = {
	
	xRot: null,
	yRot: null,
	zRot: null,
	
	xPos: null,
	yPos: null,
	zPos: null,
	
	init: function() {
		this.clear();
	},
	
	clear: function() {
		this.xRot = 0;
		this.yRot = 0;
		this.zRot = 0;
		this.xPos = 0;
		this.yPos = 0;
		this.zPos = 0;
	}
};