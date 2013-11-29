Engine.Textures = {
	
	tCount: null,
	tMap: null,

/////////////////////////////////////////
/////////////////////////////////////////
	
	loadINI: function( filename, callback ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}

		this._loadedCallback = callback;
		this._getFile( filename + '.ini', this._processINI );
	},
	
	_processINI: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing ini file' );
		}
		var file = this._getBuffer( e.target );
		if( !file ) {
			throw Error( 'cannot read ini file!' );
		}
		
		var texture;
		var textures = [];
		var fileCount = 0;
		var ch;
		var offset = 0;
		while( offset !== file.length ) {
			// store here the name of the texture
			texture = [];
			while( (ch = file.getUint8( offset, true )) && (ch !== 0x0a && ch !== 0x0d) ) {
				texture.push( String.fromCharCode( ch ) );
				// next char
				offset++;
			}
			if( texture.length ) {
				textures.push( texture.join( '' ) );
				fileCount++;
			}
			// next line
			offset++;
		}
		
		this.tCount = fileCount;
		this.tMap = [];
		this.tFilenames = textures;
		
		this._loadBMPFiles();
	},
	
	_loadBMPFiles: function() {
		var n = this.tMap.length;
		if( n === this.tFilenames.length ) {
			// done
			delete this.tFilenames;
			this._loadedCallback.call( this );
		} else {
			// keep loading
			this.tMap[n] = new BMP();
			this.tMap[n].load( this.tFilenames[n], this.loadBMPFiles );
		}
	},
	
/////////////////////////////////////////
/////////////////////////////////////////	
	
	loadBT: function( filename, callback, context ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}

		this._loadedCallback = callback;
		this._loadedContext = context || window;
		this._getFile( filename + '.bt', this._processBT );
	},
	
	_processBT: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing bt file' );
		}
		var file = this._getBuffer( e.target );
		if( !file ) {
			throw Error( 'cannot read bt file!' );
		}
		
		// load the number of textures
		this.tCount = file.getUint32( 0, true );
		file.seeker = 4;
		
		// allocate memory for bitmap images
		this.tMap = [];
		for( var i = 0; i < this.tCount; i++ ) {
			this.tMap[i] = new BMP();
		}
		
		// load palette
		this.tMap[0].loadPalette( file );
		// assign palette to all images
		for( i = 1; i < this.tCount; i++ ) {
			this.tMap[i].palette = this.tMap[0].palette;
		}
		
		// load textures
		for( i = 0; i < this.tCount; i++ ) {
			this.tMap[i].loadBT( file );
		}
		
		this._loadedCallback.call( this._loadedContext, file );
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	saveBT: function( filename, additionalBytes ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		additionalBytes = additionalBytes || 0;
		
		// we repatead the same pallete for all the textures
		var paletteSize = this.tMap[0].sizeOfPalette();
		
		// we must find how may bytes are the textures
		var btSizeTotal = 0;
		for( var i = 0; i < this.tCount; i++ ) {
			btSizeTotal += this.tMap[i].sizeOfBT();
		}
		
		var buffer = new ArrayBuffer( 4 + paletteSize + btSizeTotal + additionalBytes );
		var file = new DataView( buffer );
		file.seeker = 0;
		file.length = buffer.byteLength;
		
		// save the number of texture maps
		file.setUint32( 0, this.tCount, true );
		file.seeker = 4;
		
		// save the palette
		this.tMap[0].savePalette( file );
		
		// save the texture data
		for( var i = 0; i < this.tCount; i++ ) {
			this.tMap[0].saveBT( file );
		}
		
		return file;
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
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
		buffer.seeker = 0;
		return buffer;
	},
	
};