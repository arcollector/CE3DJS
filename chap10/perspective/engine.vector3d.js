var Vector3D = function() {
	// X, Y, Z direction vector
	this.x = null;
	this.y = null;
	this.z = null;
	// the updated (transformed) X, Y, Z, direction vector
	this.tx = null;
	this.ty = null;
	this.tz = null;
};

Vector3D.prototype = {
	
	transform: function( m ) {
		// function designed to transform a vector using the master
		// matrix
		
		// initialize temporary variables
		var x = this.x;
		var y = this.y;
		var z = this.z;
		m = m.matrix;
		
		// transform vertex by master matrix
		this.tx = x*m[0][0] + y*m[1][0] + z*m[2][0] + m[3][0];
		this.ty = x*m[0][1] + y*m[1][1] + z*m[2][1] + m[3][1];
		this.tz = x*m[0][2] + y*m[1][2] + z*m[2][2] + m[3][2];
	},	
};