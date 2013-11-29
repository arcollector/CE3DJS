var VertexTexture = function() {
	this.u = null;
	this.v = null;
	this.i = null;
};

VertexTexture.prototype = {

	add: function( pt ) {
		var temp = new VertexTexture();
		temp.u = this.u + pt.u;
		temp.v = this.v + pt.v;
		temp.i = this.i + pt.i;
		return temp;
	},
	
	minus: function( pt ) {
		var temp = new VertexTexture();
		temp.u = this.u - pt.u;
		temp.v = this.v - pt.v;
		temp.i = this.i - pt.i;
		return temp;
	},
	
	mul: function( n ) {
		var temp = new VertexTexture();
		temp.u = this.u * n;
		temp.v = this.v * n;
		temp.i = this.i * n;
		return temp;
	},
	
	div: function( n ) {
		var temp = new VertexTexture();
		temp.u = this.u / n;
		temp.v = this.v / n;
		temp.i = this.i / n;
		return temp;
	},
	
};