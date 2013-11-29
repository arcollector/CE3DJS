var Vertex = function() {
	this.lx = 0;
	this.ly = 0;
	this.lz = 0;
	this.wx = null;
	this.wy = null;
	this.wz = null;
};

Vertex.prototype = {

	equalTo: function( v ) {
		return this.lx === v.lx && this.ly === v.ly && this.lz === v.lz;
	},
	
	notEqualTo: function( v ) {
		return !this.equalTo( v );
	},
	
/**
* these functions return a new vector
*/
	minusVertex: function( v ) {
		var temp = new Vertex();
		temp.lx = this.lx - v.lx;
		temp.ly = this.ly - v.ly;
		temp.lz = this.lz - v.lz;
		return temp;
	},
	
	addVertex: function( v ) {
		var temp = new Vertex();
		temp.lx = this.lx + v.lx;
		temp.ly = this.ly + v.ly;
		temp.lz = this.lz + v.lz;
		return temp;
	},
	
	mulVertex: function( v ) {
		var temp = new Vertex();
		temp.lx = this.lx * v.lx;
		temp.ly = this.ly * v.ly;
		temp.lz = this.lz * v.lz;
		return temp;
	},
	
	divVertex: function( v ) {
		var temp = new Vertex();
		temp.lx = this.lx / v.lx;
		temp.ly = this.ly / v.ly;
		temp.lz = this.lz / v.lz;
		return temp;
	},
	
/**
* these functions works on the caller vector
*/
	minus: function( v ) {
		this.lx -= v.lx;
		this.ly -= v.ly;
		this.lz -= v.lz;
	},
	
	add: function( v ) {
		this.lx += v.lx;
		this.ly += v.ly;
		this.lz += v.lz;
	},
	
	mul: function( v ) {
		this.lx *= v.lx;
		this.ly *= v.ly;
		this.lz *= v.lz;
	},
	
	div: function( v ) {
		this.lx /= v.lx;
		this.ly /= v.ly;
		this.lz /= v.lz;
	},
	
/**
* these functions works with a scalar
* returns a new vecotor!
*/
	minusScalarVertex: function( s ) {
		var temp = new Vertex();
		temp.lx = this.lx - s;
		temp.ly = this.ly - s;
		temp.lx = this.lz - s;
		return temp;
	},
	
	addScalarVertex: function( s ) {
		var temp = new Vertex();
		temp.lx = this.lx + s;
		temp.ly = this.ly + s;
		temp.lx = this.lz + s;
		return temp;
	},
	
	mulScalarVertex: function( s ) {
		var temp = new Vertex();
		temp.lx = this.lx * s;
		temp.ly = this.ly * s;
		temp.lx = this.lz * s;
		return temp;
	},
	
	divScalarVertex: function( s ) {
		var temp = new Vertex();
		temp.lx = this.lx / s;
		temp.ly = this.ly / s;
		temp.lx = this.lz / s;
		return temp;
	},
	
/**
* these functions works with a scalar
*/
	minusScalar: function( s ) {
		this.lx -= s;
		this.ly -= s;
		this.lz -= s;
	},
	
	addScalar: function( s ) {
		this.lx += s;
		this.ly += s;
		this.lz += s;
	},
	
	mulScalar: function( s ) {
		this.lx *= s;
		this.ly *= s;
		this.lz *= s;
	},
	
	divScalar: function( s ) {
		this.lx /= s;
		this.ly /= s;
		this.lz /= s;
	},
	
/**
*/
	mag: function() {
		return Math.sqrt( this.lx*this.lx + this.ly*this.ly + this.lz*this.lz );
	},
	
	// this function must calle if and only if the caller and the arg vector are both unit vectors!!!
	dotUnit: function( v ) {
		return this.lx*v.lx + this.ly*v.ly + this.lz*v.lz;
	},
	
	dotNonUnit: function( v ) {
		return this.doUnit( v ) / ( this.mag() * v.mag() );
	},
	
/**
*/
	transform: function( m ) {
		var lx = this.lx;
		var ly = this.ly;
		var lz = this.lz;
		m = m.matrix;
		
		// transform vertex by master matrix
		this.wx = lx*m[0][0] + ly*m[1][0] + lz*m[2][0] + m[3][0];
		this.wy = lx*m[0][1] + ly*m[1][1] + lz*m[2][1] + m[3][1];
		this.wz = lx*m[0][2] + ly*m[1][2] + lz*m[2][2] + m[3][2];
	},
	
	untransform: function( m ) {
		// initialize temporary variables:
		var wx = this.wx;
		var wy = this.wy;
		var wz = this.wz;
		var invMatrix =[[],[],[],[]];
		var pivot;
		var i, j, k;
		m = m.matrix;

		for( i = 0; i < 4; i++ ) {
			invMatrix[i][0] = m[i][0];
			invMatrix[i][1] = m[i][1];
			invMatrix[i][2] = m[i][2];
			invMatrix[i][3] = m[i][3];
		}

		for( i = 0; i < 4; i++ ) {
			pivot = invMatrix[i][i];
			invMatrix[i][i] = 1;
			for( j = 0; j < 4; j++) {
				invMatrix[i][j] /= pivot;
			}
			for( k = 0; k < 4; k++) {
				if( k === i ) {
					continue;
				}
				pivot = invMatrix[k][i];
				invMatrix[k][i] = 0;
				for( j = 0; j < 4; j++ ) {
					invMatrix[k][j] -= pivot * invMatrix[i][j];
				}
			}
		}

		// transform vertex by inverse master matrix:
		this.lx = wx*invMatrix[0][0] + wy*invMatrix[1][0] + wz*invMatrix[2][0] + invMatrix[3][0];
		this.ly = wx*invMatrix[0][1] + wy*invMatrix[1][1] + wz*invMatrix[2][1] + invMatrix[3][1];
		this.lz = wx*invMatrix[0][2] + wy*invMatrix[1][2] + wz*invMatrix[2][2] + invMatrix[3][2];
	},
	
};