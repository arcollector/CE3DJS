// a class that steps on the ceilin of integers - always steps
// on Y. Rendering it useless for anything but polygon
// restarization
var LineSegment = function() {
	this.x1 = null;
	this.y1 = null;
	this.x2 = null;
	this.y2 = null;
	this.x = null;
	this.y = null;
	this.z = null;
	this.u = null;
	this.v = null;
	this.i = null;
	this.edgeHeight = 0;
	this.stepX = null;
	this.stepZ = null;
	this.stepU = null;
	this.stepV = null;
	this.stepI = null;
};

LineSegment.prototype = {
	
	getX: function() {
		// returns the current x coordinate
		return Math.round( this.x );
	},
	
	getY: function() {
		// returns the current y coordinate
		return Math.round( this.y );
	},
	
	getZ: function() {
		// returns the current 1/z coordinate
		return this.z;
	},
	
	getU: function() {
		// returns the current 1/U texture coordinate
		return this.u;
	},
	
	getV: function() {
		// returns the current 1/V texture coordinate
		return this.v;
	},
	
	getI: function() {
		// return the current intensity
		return this.i;
	},
	
	height: function() {
		// returns the current poly height
		return this.edgeHeight;
	},

	init: function( p1, p2 ) {
		// calculate initial values for polygon edge
		var width;
		var deltaZ, z1, z2;
		var deltaU, deltaV;
		var deltaI;
		
		this.x1 = p1.x;
		this.y1 = p1.y;
		z1 = p1.z;
		
		this.x2 = p2.x;
		this.y2 = p2.y;
		z2 = p2.z;
		
		this.x = this.x1;
		this.y = this.y1;
		this.z = z1;
		// store the U/Z and V/Z values
		this.u = p1.u;
		this.v = p1.v;
		// store the intensity value
		this.i = p1.i;
		
		this.edgeHeight = this.y2 - this.y1;
		width = this.x2 - this.x1;
		deltaZ = z2 - z1;
		// calculate U/Z and V/Z deltas
		deltaU = p2.u - p1.u;
		deltaV = p2.v - p1.v;
		// calculate the intensity delta
		deltaI = p2.i - p1.i;
		
		if( this.edgeHeight ) {
			this.stepX = width / this.edgeHeight;
			this.stepZ = deltaZ / this.edgeHeight;
			this.stepU = deltaU / this.edgeHeight;
			this.stepV = deltaV / this.edgeHeight;
			this.stepI = deltaI / this.edgeHeight;
		} else {
			this.stepX = 0;
			this.stepZ = 0;
			this.stepU = 0;
			this.stepV = 0;
			this.stepI = 0;
		}
	},
	
	step: function() {
		// step the edge
		this.x += this.stepX;
		++this.y;
		this.z += this.stepZ;
		this.u += this.stepU;
		this.v += this.stepV;
		this.i += this.stepI;
		--this.edgeHeight;
	},
	
	stepBy: function( amount ) {
		// step the edge by amount
		this.x += this.stepX * amount;
		this.y += amount;
		this.z += this.stepZ * amount;
		this.u += this.slopeU * amount;
		this.v += this.slopeV * amount;
		this.i += this.stepI * amount;
		this.edgeHeight -= amount;
	},
	
	getStepByPoint: function( amount ) {
		// return a point P + amount
		var p = new Vector2D();
		p.x = this.x + this.stepX * amount;
		p.y = this.y + amount;
		p.z = this.z + this.stepZ * amount;
		p.u = this.u + ( this.stepU * amount );
		p.v = this.v + ( this.stepV * amount );
		p.i = this.i + ( this.stepI * amount );
		return p;
	},
	
	clipTop: function( top ) {
		// clip the polygon edge against the top of the viewport -
		// Note: must be called directly after edge initialization
		var slopeX;
		var step;
		var height = this.y2 - this.y1;
		
		if( this.y < top && height ) {
			step = top - this.y;
			slopeX = (this.x2 - this.x1) / height;
			this.x = this.x1 + slopeX * step;
			this.y = top;
			this.z += this.stepZ * step;
			this.u += this.stepU * step;
			this.v += this.stepV * step;
			this.i += this.stepI * step;
			this.edgeHeight -= step;
		}
	},
	
};