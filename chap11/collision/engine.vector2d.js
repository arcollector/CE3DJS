var Vector2D = function() {
	// the screen X and Y of point
	this.x = null;
	this.y = null;
	// the 1/z value
	this.z = null;
	// the texture's position
	this.u = null;
	this.v = null;
	// the texture's intensity
	this.i = null;
};

Vector2D.prototype = {
	
	equalTo: function( v ) {
		return this.x === v.x && this.y === v.y;
	},
};