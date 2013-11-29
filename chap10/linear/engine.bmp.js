var BMP = function() {
	
	this.fileHeader = {
		// must be set to 'BM'
		bfType: null,
		// the size of the file, in bytes
		bfSize: null,
		// reserved for future expansion
		bfReserved1: null,
		// reserved for future expansion
		bfReserved2: null,
	};
	
	this.infoHeader = {
		// the number of bytes before the
		// bitmap appears in the file
		bfOffBits: null,
		// the size of the header
		biSize: null,
		// the width of the image, in pixels
		biWidth: null,
		// the height of the image, in pixels
		biHeight: null,
		// must be set to one
		biPlanes: null,
		// the number of bits per pixel
		biBitCount: null,
		// the compression scheme used
		// (BI_RGB for uncompressed images)
		biCompression: null,
		// the size of the image, in bytes
		// (only used when the image is compressed)
		biSizeImage: null,
		// the horizontal number of pixels per meter
		biXPelsPerMeter: null,
		// the vertical number of pixels per meter
		biYPelsPerMeter: null,
		// the number of colors in the bitmpa that are used
		biClrUsed: null,
		// the number of colors in the bitmap that are important
		biClrImportant: null,
	};
	
	this.colorCount = null;
	this.bitCount = null;
	
	this.image = null;
	this.palette = null;
};

BMP.prototype = {
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	load: function( filename, callback ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		this._loadedCallback = callback;
		this._getFile( filename + '.bmp', this._processBMP );
	},
	
	_processBMP: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing bmp file' );
		}
		var file = this._getBuffer( e.target );
		if( !file  ) {
			throw Error( 'cannot read bmp file!' );
		}
		
		// load the information header data
		this.fileHeader.bfType = String.fromCharCode( file.getUint8( 0, true ) ) + String.fromCharCode( file.getUint8( 1, true ) );
		this.fileHeader.bfSize = file.getUint32( 2, true );
		this.fileHeader.bfReserved1 = file.getUint16( 6, true );
		this.fileHeader.bfReserved2 = file.getUint16( 8, true );
		//console.log( this.fileHeader );
		
		// load the information header data
		this.infoHeader.bfOffBits = file.getUint32( 10, true );
		this.infoHeader.biSize = file.getUint32( 14, true );
		this.infoHeader.biWidth = file.getUint32( 18, true );
		this.infoHeader.biHeight = file.getUint32( 22, true );
		this.infoHeader.biPlanes = file.getUint16( 26, true );
		this.infoHeader.biBitCount = file.getUint16( 28, true );
		this.infoHeader.biCompression = file.getUint32( 30, true );
		this.infoHeader.biSizeImage = file.getUint32( 34, true );
		this.infoHeader.biXPelsPerMeter = file.getUint32( 38, true );
		this.infoHeader.biYPelsPerMeter = file.getUint32( 42, true );
		this.infoHeader.biClrUsed = file.getUint32( 46, true );
		this.infoHeader.biClrImportant = file.getUint32( 50, true );
		//console.log( this.infoHeader );
	
		// biSize contians the bytes count of the "infoHeader" segment
		if( this.infoHeader.biSize !== 40 ) {
			throw Error( 'bmp file version is unsupported!' );
		}
		
		// number of colors per pixel
		this.colorCount = Math.pow( 2, this.infoHeader.biBitCount );
		this.bitCount = this.infoHeader.biBitCount;
		
		if( this.bitCount !== 8 ) {
			throw Error( 'bmp file number of bits per pixel is not 8!' );
		}
		
		// is the number of bits per pixel is equal to 8, then the bitmap mus have a palette
		this.palette = [];
		var offset = 54;
		var color;
		for( var i = 0; i < this.colorCount; i++ ) {
			color = [];
			// rgbBlue
			color[2] = file.getUint8( offset, true );
			offset += 1;
			// rgbGreen
			color[1] = file.getUint8( offset, true );
			offset += 1;
			// rgbRed
			color[0] = file.getUint8( offset, true );
			offset += 1;
			// rgbReserved
			//color[3] = file.getUint8( offset, true );
			color[3] = 255;
			offset += 1;
			
			this.palette.push( color );
		}
		
		this.width = this.infoHeader.biWidth;
		this.height = this.infoHeader.biHeight;
		var imageSize = this.width * this.height;
		// all programs that write BMP files pad each row so their
		// width are evenly divisible by 4. We need to be certain that we skip
		// this padding because it's not part of the original image
		var scanWidth = ( ( this.width * ( this.bitCount / 8 ) ) + 3 ) & (~3);
		// the actual padding (if any) we'll skip at the end of each row is calculated
		// with the following statement
		var scanPadding = scanWidth - this.width * ( this.bitCount / 8 );

		if( this.infoHeader.biCompression !== 0 ) {
			throw Error( 'bmp file compression format is unsupported!' );
		}

		this.image = new Uint8ClampedArray( this.width * this.height * ( this.bitCount / 8 ) );
		// load the bitmap
		for( var y = 0; y < Math.abs( this.height ); y++ ) {
			// load a scan-line
			// uncompressed image
			// 256-color image
			
			var yPos;
			// if the height of the image is negative -identifying the bitmap as top-down,
			// we initialize yPos to the appropiate index
			if( this.height < 0 ) {
				yPos = y * this.width;
			// otherwhise (when the bitmap is bottom-up), we invert Y, and initialize yPos
			// to the proper index
			} else {
				yPos = ( ( this.height - y ) * this.width ) - this.width;
			}
			
			var j = yPos;
			for( var i = 0; i < this.width; i++ ) {
				this.image[j] = file.getUint8( offset, true );
				j++;
				offset += 1;
			}
			
			// skip the padding possibly located at the end of each
			// scan-line
			offset += scanPadding;
		}
		
		// se height to the absolute value of itself (to make it compatible with
		// out top-down convetion)
		this.height = Math.abs( this.height );
		
		this._loadedCallback.call( this );
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	saveBT: function( file ) {
		if( !(file instanceof DataView) ) {
			throw Error( 'bad file!' );
		}
		
		var offset = file.seeker;
		
		// write the image width
		file.setUint32( offset, this.width, true );
		offset += 4;
		// write the image height
		file.setUint32( offset, this.height, true );
		offset += 4;
		// write the image's bit count per pixel
		file.setUint32( offset, this.bitCount, true );
		offset += 4;
		// write the image's color count
		file.setUint32( offset, this.colorCount, true );
		offset += 4;
		// write the image
		for( var i = 0, l = this.image.length; i < l; i++ ) {
			file.setUint8( offset, this.image[i], true );
			offset += 1;
		}

		file.seeker = offset;
	},
	
	// bt stand for "binary texture"
	loadBT: function( file ) {
		if( !(file instanceof DataView) ) {
			throw Error( 'bad file!' );
		}
		
		var offset = file.seeker;
		
		// read the image width
		this.width = file.getUint32( offset, true );
		offset += 4;
		// read the image height
		this.height = file.getUint32( offset, true );
		offset += 4;
		// read the image's bit count per pixel
		this.bitCount = file.getUint32( offset, true );
		offset += 4;
		// read the image's color count
		this.colorCount = file.getUint32( offset, true );
		offset += 4;
		
		// allocate memory for image
		var l = this.width * this.height * ( this.bitCount / 8 );
		this.image = new Uint8ClampedArray( l );
		
		// read the image
		for( var i = 0; i < l; i++ ) {
			this.image[i] = file.getUint8( offset, true );
			offset += 1;
		}
		
		file.seeker = offset;
	},
	
	sizeOfBT: function() {
		var bytes = 0;
		// image width
		bytes += 4;
		// image height
		bytes += 4;
		// image's bit count per pixel
		bytes += 4;
		// image's color count
		bytes += 4;
		// image bitmap
		bytes += this.image.length;
		
		return bytes;
	},
	
/////////////////////////////////////////
/////////////////////////////////////////
	
	savePalette: function( file ) {
		if( !(file instanceof DataView) ) {
			throw Error( 'bad file!' );
		}
		
		var offset = file.seeker;
		
		// write the color count
		file.setUint32( offset, this.colorCount, true );
		offset += 4;
		// write the bit count
		file.setUint32( offset, this.bitCount, true );
		offset += 4;
		// write the palette
		for( var i = 0; i < this.colorCount; i++ ) {
			color = this.palette[i];
			file.setUint8( offset, color[2], true );
			offset += 1;
			file.setUint8( offset, color[1], true );
			offset += 1;
			file.setUint8( offset, color[0], true );
			offset += 1;
			//file.setUint8( offset, color[3], true );
			file.setUint8( offset, 255, true );
			offset += 1;
		}

		file.seeker = offset;
	},
	
	loadPalette: function( file ) {
		if( !(file instanceof DataView) ) {
			throw Error( 'bad file!' );
		}
		
		var offset = file.seeker;
		// load the color count
		this.colorCount = file.getUint32( offset, true );
		offset += 4;
		// load the bit count
		this.bitCount = file.getUint32( offset, true );
		offset += 4;
		// allocate memory for palette
		this.palette = [];
		// load the palette
		var color;
		for( var i = 0; i < this.colorCount; i++ ) {
			color = [];
			color[2] = file.getUint8( offset, true );
			offset += 1;
			color[1] = file.getUint8( offset, true );
			offset += 1;
			color[0] = file.getUint8( offset, true );
			offset += 1;
			//color[3] = file.getUint8( offset, true );
			color[3] = 255;
			offset += 1;
			
			this.palette.push( color );
		}
		file.seeker = offset;
	},
	
	sizeOfPalette: function() {
		var bytes = 0;
		// color count
		bytes += 4;
		// bit count
		bytes += 4;
		// the palette always is RGBA [256] 
		bytes += 256 * 4;
		
		return bytes;
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
		return buffer;
	},
};
