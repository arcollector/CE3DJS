var Matrix3D = function() {
	// the 3D view matrix class
	
	this.matrix = [ [],[],[],[] ];
	this.rMatrix = [ [],[],[],[] ];

	this.xR = 0;
	this.yR = 0;
	this.zR = 0;
	
	this.xTrans = 0;
	this.yTrans = 0;
	this.zTrans = 0;
};

Matrix3D.prototype = {

	initMat: function( mat ) {
		// initialize a specific matrix to the identity matrix
		mat[0][0] = 1;
		mat[0][1] = 0;
		mat[0][2] = 0;
		mat[0][3] = 0;
		
		mat[1][0] = 0;
		mat[1][1] = 1;
		mat[1][2] = 0;
		mat[1][3] = 0;
		
		mat[2][0] = 0;
		mat[2][1] = 0;
		mat[2][2] = 1;
		mat[2][3] = 0;
		
		mat[3][0] = 0;
		mat[3][1] = 0;
		mat[3][2] = 0;
		mat[3][3] = 1;
	},
	
	mergeMatrix: function( newMatrix ) {
		// multiply newMatrix by matrix: store the result in tempMatrix
		var tempMatrix = [ [],[],[],[] ];
		for( var i = 0; i < 4; i++ ) {
			for( var j = 0; j < 4; j++ ) {
				tempMatrix[i][j] = (
					this.matrix[i][0]*newMatrix[0][j] + 
					this.matrix[i][1]*newMatrix[1][j] + 
					this.matrix[i][2]*newMatrix[2][j] + 
					this.matrix[i][3]*newMatrix[3][j]
				);
			}
		}
		// copy tempMatrix to matrix
		for( i = 0; i < 4; i++ ) {
			this.matrix[i][0] = tempMatrix[i][0];
			this.matrix[i][1] = tempMatrix[i][1];
			this.matrix[i][2] = tempMatrix[i][2];
			this.matrix[i][3] = tempMatrix[i][3];
		}
	},
	
	mergeMatrices: function( dest, source ) {
		// multiply source by dest: store result in temp
		var temp = [ [],[],[],[] ];
		for( var i = 0; i < 4; i++ ) {
			for( var j = 0; j < 4; j++ ) {
				temp[i][j] = (
					source[i][0]*dest[0][j] +
					source[i][1]*dest[1][j] + 
					source[i][2]*dest[2][j] + 
					source[i][3]*dest[3][j]
				);
			}
		}
		// copy temp to dest
		for( i = 0; i < 4; i++ ) {
			dest[i][0] = temp[i][0];
			dest[i][1] = temp[i][1];
			dest[i][2] = temp[i][2];
			dest[i][3] = temp[i][3];
		}
	},
	
	rotate: function( xa, ya, za ) {
		// generate 3d rotation matrix
		xa *= Math.PI / 180;
		ya *= Math.PI / 180;
		za *= Math.PI / 180;
		this.xR = xa; 
		this.yR = ya;
		this.zR = za;
		
		var rMat = [ [],[],[],[] ];
		
		this.initMat( this.rMatrix );
		
		// initialize Z rotation matrix - Note: we perform Z
		// rotation first to align the 3D Z axis with the 2D Z axis
		rMat[0][0] = Math.cos( za );
		rMat[0][1] = Math.sin( za );
		rMat[0][2] = 0;
		rMat[0][3] = 0;
		
		rMat[1][0] = -Math.sin( za );
		rMat[1][1] = Math.cos( za );
		rMat[1][2] = 0;
		rMat[1][3] = 0;
		
		rMat[2][0] = 0;
		rMat[2][1] = 0;
		rMat[2][2] = 1;
		rMat[2][3] = 0;
		
		rMat[3][0] = 0;
		rMat[3][1] = 0;
		rMat[3][2] = 0;
		rMat[3][3] = 1;
		
		// merge matrix with master matrix
		this.mergeMatrices( this.rMatrix, rMat );
		
		// initialize X rotation matrix
		rMat[0][0] = 1;
		rMat[0][1] = 0;
		rMat[0][2] = 0;
		rMat[0][3] = 0;
		
		rMat[1][0] = 0;
		rMat[1][1] = Math.cos( xa );
		rMat[1][2] = Math.sin( xa );
		rMat[1][3] = 0;
		
		rMat[2][0] = 0;
		rMat[2][1] = -Math.sin( xa );
		rMat[2][2] = Math.cos( xa );
		rMat[2][3] = 0;
		
		rMat[3][0] = 0;
		rMat[3][1] = 0;
		rMat[3][2] = 0;
		rMat[3][3] = 1;
		
		// merge matrix with master matrix
		this.mergeMatrices( this.rMatrix, rMat );
		
		// initialize Y rotation matrix
		rMat[0][0] = Math.cos( ya );
		rMat[0][1] = 0;
		rMat[0][2] = -Math.sin( ya );
		rMat[0][3] = 0;
		
		rMat[1][0] = 0;
		rMat[1][1] = 1;
		rMat[1][2] = 0;
		rMat[1][3] = 0;
		
		rMat[2][0] = Math.sin( ya );
		rMat[2][1] = 0;
		rMat[2][2] = Math.cos( ya );
		rMat[2][3] = 0;
		
		rMat[3][0] = 0;
		rMat[3][1] = 0;
		rMat[3][2] = 0;
		rMat[3][3] = 1;
		
		// merge matrix with master matrix
		this.mergeMatrices( this.rMatrix, rMat );
		
		this.mergeMatrix( this.rMatrix );
	},
	
	translate: function( xt, yt, zt ) {
		// create a 3D translation
		
		// declare translation matrix
		var tMat = [ [],[],[],[] ];
		
		// save translation values
		this.xTrans = xt;
		this.yTrans = yt;
		this.zTrans = zt;
		
		// initialize translation matrix
		tMat[0][0] = 1;
		tMat[0][1] = 0;
		tMat[0][2] = 0;
		tMat[0][3] = 0;
		
		tMat[1][0] = 0;
		tMat[1][1] = 1;
		tMat[1][2] = 0;
		tMat[1][3] = 0;
		
		tMat[2][0] = 0;
		tMat[2][1] = 0;
		tMat[2][2] = 1;
		tMat[2][3] = 0;
		
		tMat[3][0] = xt;
		tMat[3][1] = yt;
		tMat[3][2] = zt;
		tMat[3][3] = 1;
		
		// merge matrix with master matrix
		this.mergeMatrix( tMat );
	},
	
	scale: function( xs, ys, zs ) {
		// function designed to merge scaling matrix with master
		// matrix
		
		// create 3D scaling matrix
		var sMat = [ [],[],[],[] ];
		
		// initialize scaling matrix
		sMat[0][0] = xs;
		sMat[0][1] = 0;
		sMat[0][2] = 0;
		sMat[0][3] = 0;
	
		sMat[1][0] = 0;
		sMat[1][1] = ys;
		sMat[1][2] = 0;
		sMat[1][3] = 0;
		
		sMat[2][0] = 0;
		sMat[2][1] = 0;
		sMat[2][2] = zs;
		sMat[2][3] = 0;
		
		sMat[3][0] = 0;
		sMat[3][1] = 0;
		sMat[3][2] = 0;
		sMat[3][3] = 1;
		
		// merge matrix with master matrix
		this.mergeMatrix( sMat );
	},
	
	shear: function( xs, ys ) {
		// create 3D shearing matrix
		
		var sMat = [ [],[],[],[] ];
		
		// initialize shearing matrix
		sMat[0][0] = 1;
		sMat[0][1] = 0;
		sMat[0][2] = 0;
		sMat[0][3] = 0;
		
		sMat[1][0] = 0;
		sMat[1][1] = 1;
		sMat[1][2] = 0;
		sMat[1][3] = 0;
		
		sMat[2][0] = 0;
		sMat[2][1] = 0;
		sMat[2][2] = 1;
		sMat[2][3] = 0;
		
		sMat[3][0] = 0;
		sMat[3][1] = 0;
		sMat[3][2] = 0;
		sMat[3][3] = 1;
		
		// merge matrix with master matrix
		this.mergeMatrix( sMat );
	},
	
	initialize: function() {
		this.matrix[0][0] = 1;
		this.matrix[0][1] = 0;
		this.matrix[0][2] = 0;
		this.matrix[0][3] = 0;
		
		this.matrix[1][0] = 0;
		this.matrix[1][1] = 1;
		this.matrix[1][2] = 0;
		this.matrix[1][3] = 0;
		
		this.matrix[2][0] = 0;
		this.matrix[2][1] = 0;
		this.matrix[2][2] = 1;
		this.matrix[2][3] = 0;
		
		this.matrix[3][0] = 0;
		this.matrix[3][1] = 0;
		this.matrix[3][2] = 0;
		this.matrix[3][3] = 1;
	},
	
	getXt: function() {
		return this.xTrans;
	},
	
	getYt: function() {
		return this.yTrans;
	},
	
	getZt: function() {
		return this.zTrans;
	},
	
	copyTo: function( m ) {
		var matrix = m.matrix;
		for( i = 0; i < 4; i++ ) {
			matrix[i][0] = this.matrix[i][0];
			matrix[i][1] = this.matrix[i][1];
			matrix[i][2] = this.matrix[i][2];
			matrix[i][3] = this.matrix[i][3];
		}
		
		m.xR = this.xR;
		m.yR = this.xR;
		m.zR = this.xR;

		m.xTrans = this.xTrans;
		m.yTrans = this.yTrans;
		m.zTrans = this.zTrans;
	}
	
};