Engine.Shade = {

	COLOR_COUNT: Engine.COLOR_COUNT || 256,
	// this means that for each color it will 32 possible shades
	SHADE_COUNT: Engine.SHADE_COUNT || 32,
	
	shade: null,
	
	generate: function( r2, g2, b2, palette ) {
		
		var count, n;
		
		var r, g, b;
		var r1, g1, b1;
		var deltaR, deltaG, deltaB;
		var stepR, stepG, stepB;
		
		// store here the shading palette
		this.shade = [];
		
		// cycle all the color (256 total)
		for( count = 0; count < this.COLOR_COUNT; count++ ) {
			// store red, green and blue components of the current color
			r1 = palette[count][0];
			g1 = palette[count][1];
			b1 = palette[count][2];
			// calculate the delta between the target color and the current color
			deltaR = r2 - r1;
			deltaG = g2 - g1;
			deltaB = b2 - b1;
			// interpolate the current color to the target color in 32 steps
			// so we set our initial starting color to the variables R, G and B
			r = r1;
			g = g1;
			b = b1;
			stepR = deltaR / this.SHADE_COUNT;
			stepG = deltaG / this.SHADE_COUNT;
			stepB = deltaB / this.SHADE_COUNT;
			// cycle through each of the 32 shades
			for( n = 0; n < this.SHADE_COUNT; n++ ) {
				// we assign the proper position in the shade array to the palette index
				// which most closely matches the color we've generated
				this.shade[n*this.COLOR_COUNT + count] = this.getColor( r, g, b, palette );
				// increment the color to its next phase
				r += stepR;
				g += stepG;
				b += stepB;
			}
		}
	},
	
	load: function( filename, callback, context ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}
		
		this._loadedCallback = callback;
		this._loadedContenxt = context || window;
		this._getFile( filename + '.tab', this._processShade );
	},
	
	_processShade: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing tab file' );
		}
		var file = this._getBuffer( e.target );
		if( !file  ) {
			throw Error( 'cannot read tab file!' );
		}
		
		// init the shading palette
		this.shade = [];
		
		var offset = 0;
		for( var i = 0; i < this.COLOR_COUNT * this.SHADE_COUNT; i++ ) {
			this.shade[i] = file.getUint8( offset, true );
			offset += 1;
		}
		
		this._loadedCallback.call( this._loadedContenxt );
	},
	
	save: function( filename ) {
		if( !filename ) {
			throw Error( 'missing filename!' );
		}

		var i;
		var l = this.COLOR_COUNT * this.SHADE_COUNT;
		
		var buffer = new ArrayBuffer( l );
		var file = new DataView( buffer );

		var offset = 0;
		for( i = 0; i < l; i++ ) {
			file.setUint8( offset, this.shade[i], true );
			offset += 1;
		}

		// create the download link
		var blob = new Blob( [ buffer ], { type: 'application/octet-binary' } );
		var a = document.createElement( 'a' );
		a.setAttribute( 'download', filename + '.tab' );
		a.setAttribute( 'href', URL.createObjectURL( blob ) );
		a.style.display = 'none';
		document.body.appendChild( a );
		// show downalod window
		a.click();
	},
	
	getColor: function( red, green, blue, palette ) {
		// returns an index to the color that most closely matches
		// the requested one given a specified palette
		var count;
		
		var dRed, dGreen, dBlue;
		var dist = [];
		
		// an exhaustive search must be performed through the palette array
		// to find the color most closely matching the requested color.
		// the first step in this process is to calculate the distance from each RGB value
		// in the palette to the requested one.
		// finding the closest color is as easy as finding the shortest distance from
		// the specified RGB color to all of the colors in the palette
		for( count = 0; count < this.COLOR_COUNT; count++ ) {
			dRed = red - palette[count][0];
			dGreen = green - palette[count][1];
			dBlue = blue - palette[count][2];
			dist[count] = Math.sqrt( dRed*dRed + dGreen*dGreen + dBlue*dBlue );
		}
		
		// when ve've calculated all of the distances, we must perform the search
		// through the array to determine the smallest distance
		
		// the loop below cycles through all the colors, replacing closeColor -the index
		// representing the color most closely matching the specified color
		var closestColor = 0;
		var distColor = dist[0];
		for( count = 1; count < this.COLOR_COUNT; count++ ) {
			if( dist[count] < distColor ) {
				distColor = dist[count];
				closestColor = count;
			}
		}
		
		return closestColor;
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