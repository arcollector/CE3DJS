var Mesh = function() {
	// temporary vertex list (used for loading)
	this.tList = null; // instanceof Vertex
	// the vertex count
	this.vCount = 0;
	// the poligon count
	this.pCount = 0;
	// the list of vertices
	this.vList = []; // instanceof Vertex
	this.pList = []; // instanceof Polygon
	this.select = -1;
	// morphing flag
	this.isMorphing = false;
	this.triggerMorphingProcess = false;
	// array of translate vectors which perform the actual morph
	// when tjey are added to vList
	this.mList = [];
};

Mesh.prototype = {
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	getChar: function( buffer ) {
		var start = this.seeker;
		// is end of file
		if( start === buffer.length ) {
			return null;
		}
		// set to next
		this.seeker++;
		// return the char
		return buffer.getInt8( start );
	},
	
	isSpace: function( ch ) {
		return ch === 0x09 || ch === 0x20 || ch === 0x0a || ch === 0x0b || ch === 0x0c || ch === 0x0d;
	},
	
	isLineBreak: function( ch ) {
		return ch === 0x0a || ch === 0x0d;
	},
	
	keyCodeToChar: function( ch ) {
		return String.fromCharCode( ch );
	},

	getLine: function( buffer ) {
		// reads a line of text from a text file
		var nextByte = this.getChar( buffer );
		var string = [];
		
		while( this.isLineBreak( nextByte ) ) {
			nextByte = this.getChar( buffer )
		}
		
		// loop until we reach a new-line character
		while( !this.isLineBreak( nextByte ) ) {
			// check for end of file
			if( !nextByte ) {
				// if found, close off string
				// and return EOF
				return null;
			}
			
			// if the next byte is not a space...
			if( !this.isSpace( nextByte ) ) {
				// ...record it
				string.push( this.keyCodeToChar( nextByte ) );
			}
			
			// get the next character
			nextByte = this.getChar( buffer );
		}
		
		// close of the string and returns success
		return string.join( '' );
	},
	
/////////////////////////////////////////
/////////////////////////////////////////

	loadVertex: function( file ) {
		// loads a single coordinate from a text file
		
		// point counter
		var pCount = 0;
		var vertex = new Vertex();
		var string;
		
		while( pCount < 3 ) {
			string = this.getLine( file );
			// EOF
			if( string === null ) {
				vertex.lx = 0;
				vertex.ly = 0;
				vertex.lz = 0;
				break;
			}
			if( !string ) {
				continue;
			}
			
			// check for the first X coordinate
			if( string === '10' ) {
				string = this.getLine( file );
				vertex.lx = parseFloat( string );
				++pCount;
			// check for the second X coordinate
			} else if( string === '11' ) {
				string = this.getLine( file );
				vertex.lx = parseFloat( string );
				++pCount;
			// check for the third X coordinate
			} else if( string === '12' ) {
				string = this.getLine( file );
				vertex.lx = parseFloat( string );
				++pCount;
			// check for the fourth X coordinate
			} else if( string === '13' ) {
				string = this.getLine( file );
				vertex.lx = parseFloat( string );
				++pCount;
		
			// check for the first Y coordinate
			} else if( string === '20' ) {
				string = this.getLine( file );
				vertex.ly = parseFloat( string );
				++pCount;
			// check for the second Y coordinate
			} else if( string === '21' ) {
				string = this.getLine( file );
				vertex.ly = parseFloat( string );
				++pCount;
			// check for the third Y coordinate
			} else if( string === '22' ) {
				string = this.getLine( file );
				vertex.ly = parseFloat( string );
				++pCount;
			// check for the fourth Y coordinate
			} else if( string === '23' ) {
				string = this.getLine( file );
				vertex.ly = parseFloat( string );
				++pCount;
			
			// check for the first Z coordinate
			} else if( string === '30' ) {
				string = this.getLine( file );
				vertex.lz = parseFloat( string );
				++pCount;
			// check for the second Z coordinate
			} else if( string === '31' ) {
				string = this.getLine( file );
				vertex.lz = parseFloat( string );
				++pCount;
			// check for the third Z coordinate
			} else if( string === '32' ) {
				string = this.getLine( file );
				vertex.lz = parseFloat( string );
				++pCount;
			// check for the fourth Z coordinate
			} else if( string === '33' ) {
				string = this.getLine( file );
				vertex.lz = parseFloat( string );
				++pCount;
			}
		}
		
		// return a copy of the loaded vertex
		return vertex;
	},
	
	countPolygons: function( file ) {
		// count the number of polygons in a text file
		
		var string;
		var pCount = 0;

		// loop until we come to the end of the file
		while( 1 ) {
			// get a line of text
			string = this.getLine( file );
			if( string === null ) {
				break;
			}
			
			// search for a polygon (3DFACE)
			if( string === '3DFACE' ) {
				++pCount;
			}
		}
		
		// return number of vertices
		return pCount;
	},
	
	loadVertices: function( file ) {
		// load all vertices from a DXF text file
		
		// declare/initialize variables
		this.pCount = this.countPolygons( file );

		// allocate memory for temporary list
		this.tList = [];
		
		// the vertex index in the temporary list
		var vIndex = 0;
		var count;
		
		// open file - abort if error
		this.seeker = 0;
		
		// an all-purpose string
		var string;
		
		// loop until we come to the end of the file
		while( 1 ) {
			// get a line of text
			string = this.getLine( file );
			if( string === null ) {
				break;
			}
			
			// if a 3DFACE entity is encountered...
			if( string === '3DFACE' ) {
				// load four vertices
				for( count = 0; count < 4; count++ ) {
					// load the next coordinate
					var tPoint3D = this.loadVertex( file );
					this.tList[vIndex] = tPoint3D;
					vIndex++;
				}
			}
		}
		
		// set the vertex count at zero
		this.vCount = 0;
		
		// allocate memory for vert liext - abort if error
		this.vList = [];
		
		// copy tList to vList
		for( count = 0; count < vIndex; count++ ) {
			if( !Vertex.isVertexRepeated( this.tList[count], this.vList, this.vCount ) ) {
				this.vList[this.vCount] = this.tList[count];
				// increment the vertex count/index
				++this.vCount;
			}
		}
		
		// return true (success)
		return true;
	},
	
	loadPolygons: function() {
		// read the polygon data from a DXF file
		// note: assumes all vertices have been load via member
		//	function "loadVertices"
		
		// allocate memory for polygons
		this.pList = [];
		
		var vIndex = 0;
		
		// loop until we come to the end of the file
		for( var pIndex = 0; pIndex < this.pCount; pIndex++ ) {
			// load an entire polygon
			this.pList[pIndex] = new Polygon();
			vIndex = this.loadPolygon( vIndex, pIndex );
		}
		
		// deallocate temporary list data
		delete this.tList;
		
		// return true (success)
		return true;
	},
	
	loadPolygon: function( vIndex, index ) {
		// load a polygon from a DXF text file
		
		// 3DFACE has been found - load four coordinates
		for( var count = 0; count < 4; count++ ) {
			// assing a vertex to the polygon
			this.pList[index].vList[count] = this.vList[Vertex.getVertIndex( this.tList[vIndex], this.vList, this.vCount )];
			// increment the vertex index
			++vIndex;
		}
		
		this.pList[count].calcRadius();
		// calculate panel normal
		this.pList[index].calcNormal();
		
		// calc color (must the light intializied prevously)
		this.pList[index].calcInten();

		return vIndex;
	},
	
	loadDXF: function( filename, callback ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		this._loadedCallback = callback;
		// load an object from a DXF text file
		this._getFile( filename + '.dxf', this._processDXF );
	},
	
	_processDXF: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing dxf file' );
		}
		var file = this._getBuffer( e.target );
		if( !file  ) {
			throw Error( 'cannot read dxf file!' );
		}
		// init seeker pos
		this.seeker = 0;
		
		this.loadVertices( file  );
		this.loadPolygons();
		
		this._loadedCallback.call( this );
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	readBIN: function( filename, callback, context ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		
		this._loadedCallback = callback;
		this._loadedContext = context || window;
		// load an object from a BIN binary file
		this._getFile( filename + '.bin', this._processBIN );
	},
	
	_processBIN: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing bin file' );
		}
		var buffer = this._getBuffer( e.target );
		if( !buffer ) {
			throw Error( 'cannot read bin file!' );
		}
		
		var vCount, pCount, count;
		var pIndex, vIndex;
		
		this.vList = [];
		this.pList = [];
		
		vCount = buffer.getUint32( 0, true );
		this.vCount = vCount;
		pCount = buffer.getUint32( 4, true );
		this.pCount = pCount;

		// load vertices
		var offset = 8;
		for( count = 0; count < vCount; count++ ) {
			this.vList[count] = new Vertex();
			this.vList[count].lx = buffer.getFloat32( offset, true );
			offset += 4;
			this.vList[count].ly = buffer.getFloat32( offset, true );
			offset += 4;
			this.vList[count].lz = buffer.getFloat32( offset, true );
			offset += 4;
		}
		
		// load polygon data
		for( count = 0; count < pCount; count++ ) {
			this.pList[count] = new Polygon();
			for( vIndex = 0; vIndex < 4; vIndex++ ) {
				pIndex = buffer.getUint16( offset, true );
				offset += 2;
				this.pList[count].vList[vIndex] = this.vList[pIndex];
			}
			this.pList[count].calcRadius();
			this.pList[count].calcNormal();
			// calculate the polygon's intesity
			this.pList[count].calcInten();
		}

		this._loadedCallback.call( this._loadedContext );
	},
	
	writeBIN: function( filename ) {
		// write a BIN binary file
		
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		
		var vertCount = this.vCount;
		var panelCount = this.pCount;
		var count;
		var pIndex;
		var vIndex;
		var pVert;
		
		var buffer = new ArrayBuffer( 4+4 + 4*vertCount*3 + 2*panelCount*4 );
		var file = new DataView( buffer );

		file.setUint32( 0, vertCount, true );
		file.setUint32( 4, panelCount, true );

		// write vertex data
		var offset = 8;
		for( count = 0; count < this.vCount; count++ ) {
			file.setFloat32( offset, this.vList[count].lx, true );
			offset += 4;
			file.setFloat32( offset, this.vList[count].ly, true );
			offset += 4;
			file.setFloat32( offset, this.vList[count].lz, true );
			offset += 4;
		}

		// write panel data
		for( count = 0; count < this.pCount; count++ ) {
			for( vIndex = 0; vIndex < 4; vIndex++ ) {
				pVert = this.pList[count].vList[vIndex];
				pIndex = Vertex.getVertIndex( pVert, this.vList, this.vCount );
				file.setUint16( offset, pIndex, true );
				offset += 2;
			}
		}
		
		// create the download link
		var blob = new Blob( [ buffer ], { type: 'application/octet-binary' } );
		var a = document.createElement( 'a' );
		a.setAttribute( 'download', filename + '.bin' );
		a.setAttribute( 'href', URL.createObjectURL( blob ) );
		a.style.display = 'none';
		document.body.appendChild( a );
		// show downalod window
		a.click();
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	transform: function( m ) {
		// translates/rotates/morphs entire vertex list
		var count;
		
		// transform the vertex list
		if( this.isMorphing && this.triggerMorphingProcess ) {
			for( count = 0; count < this.vCount; count++ ) {
				this.vList[count].transform( m );
				// perform the morph
				this.vList[count].add( this.mList[count] );
			}
			
		} else {
			for( count = 0; count < this.vCount; count++ ) {
				this.vList[count].transform( m );
			}
		}
		
		// re-calculate the normal
		for( count = 0; count < this.pCount; count++ ) {
			this.pList[count].updateNormal( m );
		}
	},
	
	display: function( screen, zBuffer ) {
		var count;
		var polygon;
		
		if( this.select < 0 || this.select >= this.pCount || this.pList[this.select].invisible ) {
			this.selectNextPolygon();
		}

		for( count = 0; count < this.pCount; count++ ) {
			polygon = this.pList[count];
			// check if the panel is completly outside of NEAR or FAR plane
			if( !polygon.isOutsideFrustum() && !polygon.isBackFace() ) {
				// clip panel z point if the panel it's partially below the NEAR plane
				polygon.doClipZNear();
				// project the vertex (calculate the screen coordinates)
				polygon.project();
				if( !polygon.isOutsideViewport() ) {
					polygon.display( screen, zBuffer );
				}
			}
		}
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	initDefTextures: function() {
		// initializes default texture/shape coords
		var count;
		var polygon;
		var attributes;
		var color;
		var height = Engine.Textures.tMap[0].width - 1;
		var width = Engine.Textures.tMap[0].height - 1;
		
		for( count = 0; count < this.pCount; count++ ) {
			polygon = this.pList[count];
			attributes = polygon.attributes;
			color = polygon.color;
			
			attributes[0].u = 0;
			attributes[0].v = 0;
			attributes[0].i = color;
			
			attributes[1].u = width;
			attributes[1].v = 0;
			attributes[1].i = color;
			
			attributes[2].u = width;
			attributes[2].v = height;
			attributes[2].i = color;
			
			attributes[3].u = 0;
			attributes[3].v = height;
			attributes[3].i = color;
			
			polygon.bindedTexture = 0;
		}
	},
	
	selectNextPolygon: function() {
		// selects the next visible polygon
		var oldSelect = this.select % this.pCount;
		var count;
		// deselect all old panels
		for( count = 0; count < this.pCount; count++ ) {
			this.pList[count].deselect();
		}
		// select the next visible panel
		this.select++;
		if( this.select >= this.pCount ) {
			this.select = 0;
		}
		// make a circular walk
		var i = 0;
		while( this.pList[this.select].invisible && i !== this.pCount ) {
			if( this.select === oldSelect ) {
				this.select = -1;
				break;
			}
			this.select++;
			if( this.select >= this.pCount ) {
				this.select = 0;
			}
			i++;
		}
		if( this.select !== -1 ) {
			this.pList[this.select].select();
		}
	},
	
	moveTexture: function( ox, oy, tx, ty ) {
		var dist = [];
		var x, y;
		var count;
		var screenCount;
		var minDist;
		
		var polygon;
		var attributes;
		
		var tMap;
		
		// make sure selection is in allowed range
		if( this.select >= 0 && this.select < this.pCount ) {
			polygon = this.pList[this.select];
			
			polygon.project();
			screenCount = polygon.sCount;
			if( screenCount > 4 ) {
				screenCount = 4;
			}
			// calculate the distance from each vertex to (ox,oy)
			for( count = 0; count < screenCount; count++ ) {
				x = polygon.sList[count].x;
				y = polygon.sList[count].y;
				dist[count] = Math.sqrt( (x - ox)*(x - ox) + (y - oy)*(y - oy) );
			}
			// select minimum distance
			minDist = 0;
			for( count = 1; count < screenCount; count++ ) {
				if( dist[count] < dist[minDist] ) {
					minDist = count;
				}
			}
			
			attributes = polygon.attributes;
			// translate texture vertex by specified amount
			attributes[minDist].u += tx;
			attributes[minDist].v += ty;
			// clip selected translation
			if( attributes[minDist].u < 0 ) {
				attributes[minDist].u = 0;
			}
			if( attributes[minDist].v < 0 ) {
				attributes[minDist].v = 0;
			}
			
			tMap = Engine.Textures.tMap[polygon.bindedTexture];
			if( attributes[minDist].u >= tMap.width ) {
				attributes[minDist].u = tMap.width - 1;
			}
			if( attributes[minDist].v >= tMap.height ) {
				attributes[minDist].v = tMap.height - 1;
			}
		}
	},
	
	nextTexture: function() {
		// initializes default texture/shade coords
		if( this.select >= 0 && this.select < this.pCount ) {
			this.pList[this.select].nextTexture();
		}
	},
	
	rotateTextures: function() {
		// rotates the selected panel's texture
		if( this.select >= 0 && this.select < this.pCount ) {
			this.pList[this.select].rotateTextures();
		}
	},
	
	readTexture: function( filename, callback, context ) {
		this._loadedCallback = callback;
		this._loadedContext = context || window;
		// load the the textures
		Engine.Textures.loadBT( filename, this._processTextures, this );
	},
	
	_processTextures: function( file ) {
		// load the texture coordinates and handles
		var offset = file.seeker;

		var i, j;
		
		var polygon;
		var attribute;
		
		for( i = 0; i < this.pCount; i++ ) {
			polygon = this.pList[i];
			polygon.bindedTexture = file.getUint8( offset, true );
			offset += 1;
			for( j = 0; j < 4; j++ ) {
				attribute = new VertexTexture();
				attribute.u = file.getUint32( offset, true );
				offset += 4;
				attribute.v = file.getUint32( offset, true );
				offset += 4;
				attribute.i = file.getUint32( offset, true );
				offset += 4;
				
				polygon.attributes[j] = attribute;
			}
		}
		
		file.seeker = offset;
		
		this._loadedCallback.call( this._loadedContext );
	},
	
	writeTexture: function( filename ) {
		// save the textures
		var file = Engine.Textures.saveBT( filename, this.sizeOfTexture() );
		
		// save the textures coordinates and handles
		var offset = file.seeker;
		var i, j;
		var polygon;
		var attribute;
		for( i = 0; i < this.pCount; i++ ) {
			polygon = this.pList[i];
			file.setUint8( offset, polygon.bindedTexture, true );
			offset += 1;
			for( j = 0; j < 4; j++ ) {
				attribute = polygon.attributes[j]
				file.setUint32( offset, attribute.u, true );
				offset += 4;
				file.setUint32( offset, attribute.v, true );
				offset += 4;
				file.setUint32( offset, attribute.i, true );
				offset += 4;
			}
		}
		file.seeker = offset;
		
		// create the download link
		var blob = new Blob( [ file ], { type: 'application/octet-binary' } );
		var a = document.createElement( 'a' );
		a.setAttribute( 'download', filename + '.bt' );
		a.setAttribute( 'href', URL.createObjectURL( blob ) );
		a.style.display = 'none';
		document.body.appendChild( a );
		// show downalod window
		a.click();
	},
	
	sizeOfTexture: function() {
		var bytes = 0;
		// the textures handle (1 byte) for each polygon
		bytes += 1 * this.pCount;
		// the 4 attributes with 3 (double) variables (u,v,i) for eah polygon
		bytes += 4*3*4 * this.pCount;
		
		return bytes;
	},
	
/////////////////////////////////////////
//////////////////////////////////////////
	
	nextIntensity: function( sx, sy ) {
		var dist = [], x, y;
		var count, screenCount, minDist;
		
		// make sure selection is in allowed range
		if( this.select >= 0 && this.select < this.pCount ) {
			this.pList[this.select].project();
			screenCount = this.pList[this.select].sCount;
			if( screenCount > 4 ) {
				screenCount = 4;
			}
			// calculate the distance from each vertex to (sx, sy)
			for( count = 0; count < screenCount; count++ ) {
				x = this.pList[this.select].sList[count].x;
				y = this.pList[this.select].sList[count].y;
				dist[count] = Math.sqrt( ( x - sx ) * ( x - sx ) + ( y - sy ) * ( y - sy ) );
			}
			// select minimum distance
			minDist = 0;
			for( count = 1; count < screenCount; count++ ) {
				if( dist[count] < dist[minDist] ) {
					minDist = count;
				}
			}
			// select next intensity
			this.pList[this.select].attributes[minDist].i++;
			if( this.pList[this.select].attributes[minDist].i > ( Engine.SHADE_COUNT - 1 ) ) {
				this.pList[this.select].attributes[minDist].i = 0;
			}
		}
	},
	
/////////////////////////////////////////
//////////////////////////////////////////
	
	morphTo: function( filename, steps, callback, context ) {
		// note: filename must be a BIN file
		// load an object from a BIN binary file
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		this._loadedCallback = callback;
		this._loadedContext = context || window;
		// save it for latte usage
		this._morphingSteps = steps;
		this._getFile( filename + '.bin', this._processMorphData );
	},
	
	_processMorphData: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing bin file' );
		}
		var file = this._getBuffer( e.target );
		if( !file ) {
			throw Error( 'cannot read bin file!' );
		}
		
		this.triggerMorphingProcess = true;
		
		var vertCount, panelCount, count;
		var tVert;
		
		vertCount = file.getUint32( 0, true );
		panelCount = file.getUint32( 4, true );
		
		// because there's no logical way we can morph objects that have a different
		// number of vertices, we check for this condition and abort if is the case
		if( vertCount !== this.vCount ) {
			throw Error( 'morphing target has not the same number of vertices of this mesh' );
		}
		
		// allocate memory
		this.tList = [];
		
		// if we're not already in the process of morphing, we also allocate memory
		// for a third list of vertices -the morph list of vertices. This array will contain
		// the translate vectors that will add to the starting coordinates (vList) each frame
		if( !this.isMorphing ) {
			this.isMorphing = true;
			this.mList = [];
		}
		
		// load vertices - we aren't concerned width the acutal polygon data
		var offset = 8;
		for( count = 0; count < vertCount; count++ ) {
			this.tList[count] = new Vertex();
			this.tList[count].lx = file.getFloat32( offset, true );
			offset += 4;
			this.tList[count].ly = file.getFloat32( offset, true );
			offset += 4;
			this.tList[count].lz = file.getFloat32( offset, true );
			offset += 4;
		}
		
		// generate morphing data to morph vList to tList
		// here's where we fill mList with the appropiate translate vectors. 
		// we do in-between morph steps.
		var steps = this._morphingSteps;
		for( count = 0; count < vertCount; count++ ) {
			this.mList[count] = (this.tList[count].minusVertex( this.vList[count] )).divScalarVertex( steps );
		}
		
		// delete memory
		this.tList = [];
		delete this._morphingSteps;
		
		this._loadedCallback.call( this._loadedContext );
	},
	
	morphStop: function() {
		this.triggerMorphingProcess = false;
	},
	
	morphStart: function() {
		this.triggerMorphingProcess = true;
	},
	
	morphRev: function() {
		// reverse the direction of the morph
		for( var count = 0; count < this.vCount; count++ ) {
			this.mList[count] = -this.mList[count];
		}
	},
	
/////////////////////////////////////////
//////////////////////////////////////////
	
	collide: function( x, y, z, radius ) {
		var count;
		var dist;
		var x2, y2, z2;
		var a, b, c, d;
		var sign;
		var minDist;
		var normY;
		
		// we subtract the height of the viewer from its Y coordinate
		// this is done so we can perfrom collision detection calculations
		// at the "feet" of the viewer as opposed to its head, since this is 
		// more realistic
		y -= Engine.VIEW_HEIGHT;
		
		// we cycles through all the polygons, because all of them
		// need to be checked for player-to-polygon collissions
		for( count = 0; count < this.pCount; count++ ) {
			// the bounding sphere test requires the radius of the polygon
			// and the viewer (both of which we have), as well as the center
			// of each one. the center of the viewer is x,y,z (the paremeter passed
			// to this function) however, we must manually calculate the center
			// of the polygon, which we do by obtaining the average of each component
			x2 = ( this.pList[count].vList[0].wx + 
				this.pList[count].vList[1].wx + 
				this.pList[count].vList[2].wx +
				this.pList[count].vList[3].wx ) / 4;
			
			y2 = ( this.pList[count].vList[0].wy + 
				this.pList[count].vList[1].wy + 
				this.pList[count].vList[2].wy +
				this.pList[count].vList[3].wy ) / 4;
			
			z2 = ( this.pList[count].vList[0].wz + 
				this.pList[count].vList[1].wz + 
				this.pList[count].vList[2].wz +
				this.pList[count].vList[3].wz ) / 4;
			// the next calculation determines the distance between the center of the
			// polygon and the viewer's position
			dist = Math.sqrt( (x2 - x)*(x2 - x) + (y2 - y)*(y2 - y) + (z2 - z)*(z2 - z) );
			// we then sum the radiim abd see if the resulting value is greater that the
			// distance between the player and the center of the polygon. if it is, we're
			// finished with the quick check, and we go on to to the slower test
			minDist = radius + this.pList[count].radius;
			if( dist <= minDist ) {
				// the final test in our algorithm determines if the player has pierced
				// the plane of the polygon whose bounding sphere has collided
				// width the player
				
				// we calculate the a,b,c,d terms from the plane equation. as covered
				// previously, the a,b,c,d terms are components of the surface normal,
				// and can therefore be caluclated in the same way we calculated them
				// for backface culling
				a = this.pList[count].normal.tx - this.pList[count].vList[0].wx;
				b = this.pList[count].normal.ty - this.pList[count].vList[0].wy;
				c = this.pList[count].normal.tz - this.pList[count].vList[0].wz;
				// however, we have to solve for the d term seprately. since the
				// equation for a plane is: ax + by + cz + d = 0
				// solving for d we get: -(ax + by + cz) = d
				// so, we know what a,b,c are, but what can we use for x,y,z? any
				// point on the polygon will work! for our purpose, the first
				// vertex will do
				d = -( a * this.pList[count].vList[0].wx +
					b * this.pList[count].vList[0].wy +
					c * this.pList[count].vList[0].wz );
				// the next calculation involves determining on which side of the plane
				// the viewer lies. the equation for this we covered above. the only
				// difference here is the use of the NOSE constant to add some padding
				// between the wall and the viewer
				sign = a*x + b*y + c*( z + Engine.NOSE ) + d;
				// if the number is negative, a collision has indeed ocurred
				if( sign <= 0 ) {
					// the Y component of the surface normal of the polygon tells us
					// how much the polygon is tilting in an upward direction,
					// because the normal is normalized, this Y component will always
					// fall in the range of zero to one. a Y component of 0 would mean
					// that the polygon is pointing downward, and is, therefore, a wall.
					// an Y component of one would indicate the polygon is a floor
					// section. somewhere in between these two numbers, we must
					// decide which polygons constitute a floor and what polygons
					// constitutes a wall. we'll define polygons with Y tilt of greater than
					// 45 degrees as wall, while polygon with a Y tilt less than 45 degrees
					// are floors. this setting allows slanted floor sections
					
					// store the Y component of the plane normal
					normY = b;
					// if panel is a wall
					if( Math.abs( normY ) < Math.sqrt( .5 ) ) {
						// at this point, we not only know that a collision has ocurred
						// with a polygon -we know that polygon is a wall. now we
						// need to slide the player along the wall. we accomplish this
						// task with a two step process: first, we calculate a point just
						// beyond the polygon; secondly, we calculate how much we
						// have to slide if we are to move to this new point. thus, we
						// solve for Z first and then X
						if( a ) {
							if( !c || !a ) {
								throw Error();
							}
							z = ( a*x + b*y + d ) / ( -c ) + 10 - Engine.NOSE;
							x = ( b*y + c*( z + Engine.NOSE ) + d ) / ( -a );
						} else {
							x = z = 0;
						}
					// else panel its a floor or ceiling
					} else {
						// if the polygon is a floor, we take the current (x,y) position
						// that the viewer is located, and, by using the plane of the
						// polygon with which the viewer collided, we solve for the
						// viewer's Y position
						if( normY > 0 ) {
							y = ( a*x + c*z + d ) / ( -b );
						}
					}
				}
			}
		}
		// lastly, we translate the viewer back up to eye-level, correcting for the
		// translate we performed at the begging of the function
		y += Engine.VIEW_HEIGHT;

		return [ x, y, z ];
	},
	
/////////////////////////////////////////
//////////////////////////////////////////
	
	_getFile: function( filename, callback ) {
		var req = new XMLHttpRequest();
		req.open( 'GET', filename );
		req.responseType = 'arraybuffer';
		req.onload = callback.bind( this );
		req.onerror = callback.bind( this );
		req.send();
	},
	
	_getBuffer: function( xhr ) {
		if( xhr.status !== 200 ) {
			if( xhr.status !== 304 ) {
				if( xhr.status !== 0 ) {
					return null;
				}
			}
		}
		var arraybuffer = xhr.response;
		if( !arraybuffer ) {
			return null;
		}
		var buffer = new DataView( arraybuffer );
		buffer.length = arraybuffer.byteLength;
		return buffer;
	},
	
};