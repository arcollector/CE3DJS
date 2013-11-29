LineSegment.clipHLine = function( x1, x2, z, zStep ) {
	// clip a horizontal "z-buffered line" line
	if( x1 < Engine.MINX ) {
		z += zStep * ( Engine.MINX - x1 );
		x1 = Engine.MINX;
	} else if( x1 > Engine.MAXX ) {
		x1 = Engine.MAXX;
	}
	
	if( x2 < Engine.MINX ) {
		x2 = Engine.MINX;
	} else if( x2 > Engine.MAXX ) {
		x2 = Engine.MAXX;
	}
	
	return [ x1, x2, z ];
};