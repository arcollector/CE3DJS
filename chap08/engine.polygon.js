var Polygon = function() {
	// 4 pointers to a vertex list
	this.vList = [];
	// the panel normal
	this.normal = new Vector3D();
	// the panel's color
	this.color = 0;
	// the panel's radius
	this.radius = null;
	// 5 max vertex that has been clipped via z near
	this.vcList = null;
	this.vcCount = null;
	// screen coordinates
	this.sList = null;
	this.sCount = null;
};

Polygon.prototype = {
	
	calcRadius: function() {
		// calculate the radius of the panel
		
		// intialize/declare variables
		var tempPoint = [];
		var center = new Vertex();
		var count;
		var distance = [];
		var dist;
		
		// create a temporary vertex list
		for( count = 0; count < 4; count++ ) {
			tempPoint[count] = new Vertex();
			tempPoint[count].lx = this.vList[count].lx;
			tempPoint[count].ly = this.vList[count].ly;
			tempPoint[count].lz = this.vList[count].lz;
		}
		
		// calculate center of polygon
		for( count = 0; count < 4; count++ ) {
			center.add( tempPoint[count] );
		}
		center.divScalar( 4 );
		
		// translate polygon to it's center
		for( count = 0; count < 4; count++ ) {
			tempPoint[count].minus( center );
		}
		
		// calculate the distance to each of the vertices
		for( count = 0; count < 4; count++ ) {
			dist = tempPoint[count].mag();
			distance[count] = dist;
		}
		
		// determine the maximum distance
		dist = distance[0];
		for( count = 1; count < 4; count++ ) {
			if( distance[count] > dist ) {
				dist = distance[count];
			}
		}
		
		// dist holds the maximum radius of the panel
		this.radius = dist;
	},
	
	calcNormal: function() {
		// calculate the normal of the panel
		
		var x1,y1,z1, x2,y2,z2, x3,y3,z3;
		
		var distance;
		
		var a,b,c;
		
		var uniqueVerts = [];
		var tVert;
		
		var count;
		var range = 1;
		
		// create a list of unique vertices
		uniqueVerts[0] = this.vList[0];
		for( count = 1; count < 4; count++ ) {
			tVert = this.vList[count];
			if( !Vertex.isVertexRepeated( tVert, uniqueVerts, range ) ) {
				uniqueVerts[range] = tVert;
				range++;
			}
		}
		
		x1 = uniqueVerts[0].lx;
		y1 = uniqueVerts[0].ly;
		z1 = uniqueVerts[0].lz;
		
		x2 = uniqueVerts[1].lx;
		y2 = uniqueVerts[1].ly;
		z2 = uniqueVerts[1].lz;
		
		x3 = uniqueVerts[2].lx;
		y3 = uniqueVerts[2].ly;
		z3 = uniqueVerts[2].lz;
		
		// use plane equation to determine plante's orientation
		a = y1*(z2 - z3) + y2*(z3 - z1) + y3*(z1 - z2);
		b = z1*(x2 - x3) + z2*(x3 - x1) + z3*(x1 - x2);
		c = x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2);
		
		// get the distance to the vector
		distance = Math.sqrt( a*a + b*b + c*c );
		
		// normalize the normal to 1 and create a point
		this.normal.x = a/distance + this.vList[0].lx;
		this.normal.y = b/distance + this.vList[0].ly;
		this.normal.z = c/distance + this.vList[0].lz;
	},
	
	updateNormal: function( m ) {
		this.normal.transform( m );
	},
	
	calcInten: function() {
		var light = Engine.Light;
		
		var mag = Math.sqrt( light.x*light.x + light.y*light.y + light.z*light.z );
		// assign a color based on normal
		var cosA = ( this.normal.x*light.x + this.normal.y*light.y + this.normal.z*light.z ) / mag;
		
		var color = Math.round( cosA*Engine.COLOR_RANGE + Engine.COLOR_START );
		if( color < 0 ) {
			color = Engine.COLOR_RANGE + color;
		}
		this.color = color;
	},
	
	isBackFace: function() {
		// determine if polygon is a backface
		
		var normal = this.normal;
		var aVector = this.vList[0];
		var direction = aVector.wx*(normal.tx - aVector.wx) + aVector.wy*(normal.ty - aVector.wy) + aVector.wz*(normal.tz - aVector.wz);
		
		return direction > 0;
	},
	
	isOutsideFrustum: function() {

		var count = 0;
		
		for( count = 0; count < 4; count++ ) {
			// conque algun wz sea mayor que minz ya me dice
			// que este poligono esta dentro del frustum
			if( this.vList[count].wz > Engine.MINZ ) {
				break;
			}
		}
		
		// todos su wz son menores a MINZ
		if( count === 4 ) {
			return true;
		}
		
		for( count = 0; count < 4; count++ ) {
			if( this.vList[count].wz < Engine.MAXZ ) {
				return false;
			}
		}
		
		return true;
	},
	
	doClipZNear: function() {
		
		var vcCount = 0;
		// store the vertex z near clipping
		this.vcList = [];
		var vcVertex;
		
		var startVertex, endVertex;
		
		var endIndex = 0;
		var startIndex = 3;
		
		// parametric shit
		var t;
		
		for( ; endIndex < 4; endIndex++ ) {
			startVertex = this.vList[startIndex];
			endVertex = this.vList[endIndex];
			
			if( startVertex.wz >= Engine.MINZ ) {
				if( endVertex.wz >= Engine.MINZ ) {
					// el punto esta totalment por delante MINZ
					// noy hay que hacer nada
					vcVertex = new Vertex();
					vcVertex.wx = endVertex.wx;
					vcVertex.wy = endVertex.wy;
					vcVertex.wz = endVertex.wz;
					this.vcList[vcCount] = vcVertex;
					vcCount++;
				
				} else {
					// end vertex is below the MINZ, so create a new point
					t = ( Engine.MINZ - startVertex.wz ) / ( endVertex.wz - startVertex.wz );
					vcVertex = new Vertex();
					vcVertex.wx = startVertex.wx + t*( endVertex.wx - startVertex.wx );
					vcVertex.wy = startVertex.wy + t*( endVertex.wy - startVertex.wy );
					vcVertex.wz = Engine.MINZ;
					this.vcList[vcCount] = vcVertex;
					vcCount++;
				}
			
			// start vertex is below the MINZ
			} else {
				// check if end vertex is over the MINZ
				if( endVertex.wz >= Engine.MINZ ) {
					// end vertex is fine, but start vertex is below the MINZ, so create a new point
					t = ( Engine.MINZ - startVertex.wz ) / ( endVertex.wz - startVertex.wz );
					vcVertex = new Vertex();
					vcVertex.wx = startVertex.wx + t*( endVertex.wx - startVertex.wx );
					vcVertex.wy = startVertex.wy + t*( endVertex.wy - startVertex.wy );
					vcVertex.wz = Engine.MINZ;
					this.vcList[vcCount] = vcVertex;
					vcCount++;
					
					// save the end point too!!
					vcVertex = new Vertex();
					vcVertex.wx = endVertex.wx;
					vcVertex.wy = endVertex.wy;
					vcVertex.wz = endVertex.wz;
					this.vcList[vcCount] = vcVertex;
					vcCount++;
					
				} else {
					// both points are below the MINZ, so dont need to create a new point
				}
			}
			// advance to the next vertex
			startIndex = endIndex;
		}
		
		this.vcCount = vcCount;
	},
	
	project: function() {
		
		this.sList = [];
		var sCount = 0;
		var sVertex;
		
		var vcVertex;
		
		var count;
		var oneOverZ;
		
		for( count = 0; count < this.vcCount; count++ ) {
			// the vertex clipped
			vcVertex = this.vcList[count];
			oneOverZ = 1 / vcVertex.wz;
			// the vertex screen coordinate
			sVertex = new Vector2D();
			sVertex.x = Math.round( vcVertex.wx * Engine.XSCALE * oneOverZ ) + Engine.XCENTER;
			sVertex.y = Math.round( vcVertex.wy * Engine.YSCALE * oneOverZ ) + Engine.YCENTER;
			// store yet the z coordinate for the z buffer algorithm
			sVertex.z = oneOverZ;
			this.sList[sCount] = sVertex;
			sCount++;
		}
		
		this.sCount = sCount;
	},
	
	isOutsideViewport: function() {
		
		var count;
		var sCount = this.sCount;
		var vertex;
		
		var xMinCount = 0;
		var xMaxCount = 0;
		var yMinCount = 0;
		var yMaxCount = 0;

		for( count = 0; count < sCount; count++ ) {
			vertex = this.sList[count];
			
			if( vertex.x < Engine.MINX ) {
				xMinCount++;
			} else if( vertex.x > Engine.MAXX ) {
				xMaxCount++;
			}
			
			if( vertex.y < Engine.MINY ) {
				yMinCount++;
			} else if( vertex.y > Engine.MAXY ) {
				yMaxCount++;
			}
		}
		
		if( xMinCount === sCount || xMaxCount === sCount || yMinCount === sCount || yMaxCount === sCount  ) {
			return true;
		}
		
		return false;
	},
	
	display: function( screen, zBuffer ) {
		// find the min y
		var top = 0;
		for( var count = 1; count < this.sCount; count++ ) {
			if( this.sList[count].y < this.sList[top].y ) {
				top = count;
			}
		}
		// the edges walker
		var leftSeg = new LineSegment();
		var leftIndex = top;
		var newLeftIndex;
		var rightSeg = new LineSegment();
		var rightIndex = top;
		var newRightIndex;
		
		// calculate the index to the buffer
		var yIndex = this.sList[top].y * Engine.WIDTH;
	
		var edgeCount = this.sCount;
		// loop for all polygon edges
		while( edgeCount > 0 ) {
			// determine if the left side of the polygon needs
			// (re)initializing
			if( leftSeg.height() <= 0 ) {
				newLeftIndex = leftIndex - 1;
				if( newLeftIndex < 0 ) {
					newLeftIndex = this.sCount - 1;
				}
				leftSeg.init( this.sList[leftIndex], this.sList[newLeftIndex] );
				leftIndex = newLeftIndex;
				--edgeCount;
				// perform object-precision clip on top of edge
				// (if necessary)
				if( leftSeg.getY() < Engine.MINY ) {
					leftSeg.clipTop( Engine.MINY );
					yIndex = Engine.MINY * Engine.WIDTH;
				}
			}
			// determine if the right side of the polygon needs
			// (re)initializing
			if( rightSeg.height() <= 0 ) {
				newRightIndex = rightIndex + 1;
				if( newRightIndex >= this.sCount ) {
					newRightIndex = 0;
				}
				rightSeg.init( this.sList[rightIndex], this.sList[newRightIndex] );
				rightIndex = newRightIndex;
				--edgeCount;
				// perform object-precision clip on top of edge
				// (if necessary)
				if( rightSeg.getY() < Engine.MINY ) {
					rightSeg.clipTop( Engine.MINY );
					yIndex = Engine.MINY * Engine.WIDTH;
				}
			}
			// subdivide polygon into trapezoid
			var height;
			if( leftSeg.height() < rightSeg.height() ) {
				height = leftSeg.height();
				if( height + leftSeg.getY() > Engine.MAXY ) {
					height = Engine.MAXY - leftSeg.getY();
					edgeCount = 0;
				}
			} else {
				height = rightSeg.height();
				if( height + rightSeg.getY() > Engine.MAXY ) {
					height = Engine.MAXY - rightSeg.getY();
					edgeCount = 0;
				}
			}
			
			while( height-- > 0 ) {
				// calculate initial values
				var xStart = leftSeg.getX();
				var xEnd = rightSeg.getX();
				var width = xEnd - xStart;
				if( width > 0 ) {
					var z = leftSeg.getZ();
					var deltaZ = rightSeg.getZ() - z;
					var zStep = deltaZ / width;
					
					// clip the scan-line
					var res = LineSegment.clipHLine( xStart, xEnd, z, zStep );
					xStart = res[0];
					xEnd = res[1];
					z = res[2];
					width = xEnd - xStart;
					var screenPointer = yIndex + xStart;
					var zPointer = yIndex + xStart;
					// loop for width of scan line
					while( width-- > 0 ) {
						if( zBuffer[zPointer] < z ) {
							zBuffer[zPointer] = z;
							// original implementation
							/*var color = Math.round( 255 - ( ( 1 / z ) / ( Engine.MAXZ / 256 ) ) );
							screen[screenPointer] = color < 0 ? Engine.COLOR_RANGE + color : color;*/
							// my implementation
							screen[screenPointer] = Math.abs( Math.round( Engine.COLOR_RANGE - ( ( 1 / z ) / ( Engine.MAXZ / Engine.COLOR_RANGE ) ) ) );
						}
						z += zStep;
						++screenPointer;
						++zPointer;
					}
				}
				leftSeg.step();
				rightSeg.step();
				yIndex += Engine.WIDTH;
			}
		}
	}
	
};