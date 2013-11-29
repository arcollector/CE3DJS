var Mesh = function() {
	// temporary vertex list (used for loading)
	this.tList = []; // instanceof Vertex
	// the vertex count
	this.vCount = 0;
	// the poligon count
	this.pCount = 0;
	// the list of vertices
	this.vList = []; // instanceof Vertex
	this.pList = []; // instanceof Polygon
};

Mesh.prototype = {
	
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
	
/**
*
*/

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
		
		// an all-purporse string
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
		this.tList = [];
		
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
		// load an object from a DXF text file
		this._loadedCallback = callback;
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
	
	readBIN: function( filename, callback ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		
		// load an object from a BIN binary file
		this._loadedCallback = callback;
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
			this.pList[count].calcNormal();
			// calculate the polygon's intesity
			this.pList[count].calcInten();
		}
		
		// calculate gourand information
		for( count = 0; count < pCount; count++ ) {
			var iPer = count / pCount * 101;
			// store here the intensities
			this.pList[count].intensity = [];
			// calculate an intesity value for each of the vertices
			for( var vIndex = 0; vIndex < 4; vIndex++ ) {
				var sharedIndex = [];
				var sharedIndexCount = 0;
				var sharedColor = 0;
				var vertex = this.pList[count].vList[vIndex];
				// search through the entire list of panels looking
				// for shared vertices
				for( var n = 0; n < pCount; n++ ) {
					if( this.pList[n].hasVertex( vertex ) ) {
						sharedIndex[sharedIndexCount] = n;
						sharedIndexCount++;
					}
				}
				if( sharedIndexCount ) {
					for( n = 0; n < sharedIndexCount; n++ ) {
						sharedColor += this.pList[sharedIndex[n]].color;
					}
					sharedColor /= sharedIndexCount;
				}
				this.pList[count].intensity[vIndex] = Math.round( sharedColor );
			}
		}

		this._loadedCallback.call( this );
	},
	
	writeBIN: function( filename, callback ) {
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
	
/**
*/
	
	_getFile: function( filename, callback ) {
		var req = new XMLHttpRequest();
		req.open( 'GET', filename );
		req.responseType = 'arraybuffer';
		req.onload = callback.bind( this );
		req.onerror = callback.bind( this );
		req.send();
	},
	
	_getBuffer: function( xhr ) {
		var arraybuffer = xhr.response;
		if( arraybuffer ) {
			var buffer = new DataView( arraybuffer );
			buffer.length = arraybuffer.byteLength;
			return buffer;
		}
		return null;
	},

/**
*
*/
	
	transform: function( m ) {
		// translates/rotates entire vertex list
		var count;
		
		// transform the vertex list
		for( count = 0; count < this.vCount; count++ ) {
			this.vList[count].transform( m );
		}
		
		// re-calculate the normal
		for( count = 0; count < this.pCount; count++ ) {
			this.pList[count].updateNormal( m );
		}
	},
	
	display: function( screen, zBuffer ) {
		var count;
		var polygon;

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
	}
};