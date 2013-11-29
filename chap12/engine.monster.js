// x,y, and z positions of the sprite, and an initialization file that holds
// of the monster's frames
var Monster = function( sx, sy, sz, filename, callback, context ) {
	if( !filename ) {
		throw Error( 'missing filename of the moster' );
	}
	
	this.frame = null;
	this.frameNum = 0;
	this.frameCount = 0;
	this.width = 0;
	this.height = 0;
	// although unusedm we set the health variable to 100 percent
	this.health = 100;
	// initialize the position and direction vector
	this.pos = new Vertex();
	this.pos.lx = sx;
	this.pos.ly = sy;
	this.pos.lz = sz;
	this.dir = new Vertex();
	this.dir.lx = sx;
	this.dir.ly = sy;
	// point down z
	this.dir.lz = sz + 10;
	
	this._loadedCallback = callback;
	this._loadedContext = context || window;
	// we'll load the initialization file names from filename
	this._getFile( filename, this._processINI );
};

Monster.prototype = {
	
	setFrameNum: function( n ) {
		// assign the sprite to a certain frame number
		if( n >= 0 && n < this.frameCount ) {
			this.frameNum = n;
		}
	},
	
	// control access to the health variable member
	// but since this variable isn't used, these functions
	// won't either
	getHealth: function() {
		return this.health;
	},
	setHealth: function( health ) {
		this.health = health;
	},
	
	show: function( m, screen, zBuffer ) {
		var px, py, pw, ph, ratio;
		var texLeft, texTop, tx, ty;
		var left, top, right, bottom;
		var tIndex, dIndex, z;
		var shade;
		// we obtain a pointer to the sprite's currently selected frame
		var texture = this.frame[this.frameNum].image;
		var color;
		
		// we transform the sprite
		// transform the position and direction vectors
		this.pos.transform( m );
		this.dir.transform( m );
		
		// we don't want to draw the sprite if it's too far away, so we
		// check it against the global constant MAXZ, which is the same
		// variable used for checking polygons to see if the are too far
		// away. By using the same variable for both, we are assured
		// that polygons and sprites will disappear at the same distance
		if( this.pos.wz > Engine.MAXZ ) {
			return false;
		}
		// we calculate the shade of the sprite in exactly the same way
		// we do it for points
		shade = Math.round( this.pos.wz / Engine.SHADE_DIV );
		// in order to prevent shade overflow, we clip the shade value
		// if it's too high (this may happend due to round errors)
		if( shade > Engine.SHADE_COUNT - 1 ) {
			shade = Engine.SHADE_COUNT - 1;
		}
		// we multiply the shade by 256, we do this because our shade
		// table is an array of singular dimension
		shade = shade << 8;
		// we make sure that the sprite isn't behind the minimun Z clipping
		// plane (ie: isn't behind the viewer). If it is, we proceed to draw the
		// sprite
		if( this.pos.wz > Engine.MINZ ) {
			// we'll have to z buffer the sprite so it renders correctly
			z = ( 1 / this.pos.wz );
			// project the sprite's center
			px = this.pos.wx * Engine.XSCALE / this.pos.wz + Engine.XCENTER;
			py = this.pos.wy * Engine.YSCALE / this.pos.wz + Engine.YCENTER;
			// similarly, we project the width and height of the sprite
			pw = this.width * Math.abs( Engine.XSCALE ) * 10 / this.pos.wz;
			ph = this.height * Math.abs( Engine.YSCALE ) * 10 / this.pos.wz;
			//with this set of four projected values, we can proceed to
			// calculate the projected boundaries of the sprite
			left = Math.round( px - ( pw / 2 ) );
			right = Math.round( px + ( pw / 2 ) );
			top = Math.round( py - ( ph / 2 ) );
			bottom = Math.round( py + ( ph / 2 ) );
			// take care of the easy clipping first
			if( right > Engine.MAXX ) {
				right = Engine.MAXX;
			}
			if( bottom > Engine.MAXY ) {
				bottom = Engine.MAXY;
			}
			// make sure the monster is on the screen
			if( right < Engine.MINY ) {
				return false;
			}
			if( bottom < Engine.MINY ) {
				return false;
			}
			if( left >= Engine.MAXX ) {
				return false;
			}
			if( top >= Engine.MAXY ) {
				return false;
			}
			
			// take care of the hard clipping next
			
			// these variables represent the upper-left corner in the
			// current frame. initially, they are assigned to zero, because
			// we want to draw the upper-left corner of the sprite.
			// but if the sprite needs clipping on the top or left sides
			// of the screen, we must adjust these values because we
			// will no longer start drawing the upper-left corner of the sprite
			texLeft = texTop = 0;
			if( left < Engine.MINX ) {
				ratio = this.width / pw;
				texLeft = Math.round( ( Engine.MINX - left ) * ratio );
				left = Engine.MINX;
			}
			if( top < Engine.MINY ) {
				ratio = this.height / ph;
				texTop = Math.round( ( Engine.MINY - top ) * ratio );
				top = Engine.MINY;
			}
			
			// we must calculate the horizontal starting position and the
			// scaling values. the horizontal starting position is, of course,
			// the left-most X coordinate in the sprite, or the clipped value
			// if the sprite has been clipped on the left side.
			var u, v, uStep, vStep;
			v = texTop << 16;
			uStep = Math.round( ( this.width << 16 ) / pw );
			vStep = Math.round( ( this.height << 16 ) / ph );
			
			// in our first loop, we cycle through each scanline of the sprite
			for( ty = top; ty < bottom; ty++ ) {
				// calculate the horizontal starting position in the sprite
				u = texLeft << 16;
				// calculate the index into the destination buffer and the
				// index into our sprite's currently selected frame
				dIndex = ty * Engine.WIDTH + left;
				tIndex = ( v >> 16 ) * this.width;
				// this loop cycles through	each pixel we must draw from
				// left to right
				for( tx = left; tx < right; tx++ ) {
					// we can't draw the proper pixel unless it is visible,
					// so we check our inverse z value against the one in
					// the z buffer at that position
					if( zBuffer[dIndex] < z ) {
						// if the point is visible, we calculate the exact
						// texture index into the sprite's frame
						color = texture[tIndex + ( u >> 16 )];
						// this is where the transparency check comes in:
						// if the color is not zero, we enter a code block
						if( color ) {
							// we look up its proper shade in our shade
							// table
							screen[dIndex] = Engine.Shade.shade[shade + color];
						}
					}
					// increment the horizontal texture coordinate and
					// the index is used fro the buffer
					u += uStep;
					++dIndex;
				}
				// increment the vertical texture coordinate
				v += vStep;
			}
		}
		
		return true;
	},
	
	// these three functions return the transformed
	// position of the sprite. these functions are mainly useful if we wish
	// to perform collision detection on our sprite
	getX: function() {
		return this.pos.wx;
	},	
	getY: function() {
		return this.pos.wy;
	},	
	getZ: function() {
		return this.pos.wz;
	},
	
	dist: function() {
		// return the distance to the sprite from point (0,0,0)
		return Math.sqrt( this.pos.wx*this.pos.wx + this.pos.wy*this.pos.wy + this.pos.wz*this.pos.wz );
	},
	
	moveToward: function( tx, ty, tz, steps, m ) {
		// vector describing the direction in which the sprite
		// must travel to reach its destination
		var p = new Vertex();
		// make sure the position of the sprite is where it should
		// be, we transform it
		this.pos.transform( m );
		// we create a direction vector representing the path of the
		// transformed sprite must take to reach the coordinate passed
		// to this function
		p.wx = this.pos.wx + ( tx - this.pos.wx ) / steps;
		// don't change the monster's height
		p.wy = this.pos.wy;
		p.wz = this.pos.wz + ( tz - this.pos.wz ) / steps;
		// perform coordinate system alignment. this function basically
		// undoes what it did to a point by creating an inverse matrix of
		// itself
		p.untransform( m );
		// once we've aligned the coordinate system, we adjust the sprite's
		// unstransfromed position
		this.pos.lx = p.lx;
		this.pos.ly = p.ly;
		this.pos.lz = p.lz;
	},
	
/////////////////////////////////////////
//////////////////////////////////////////
	
	_processINI: function( e ) {
		if( e.type === 'error' ) {
			throw Error( 'missing ini file' );
		}
		var file = this._getBuffer( e.target );
		if( !file ) {
			throw Error( 'cannot read ini file!' );
		}
		
		var bitmap;
		var bitmaps = [];
		var frameCount = 0;
		var ch;
		var offset = 0;
		while( offset !== file.length ) {
			// store here the name of the bitmap
			bitmap = [];
			while( (ch = file.getUint8( offset, true )) && (ch !== 0x0a && ch !== 0x0d) ) {
				bitmap.push( String.fromCharCode( ch ) );
				// next char
				offset++;
			}
			if( bitmap.length ) {
				bitmaps.push( bitmap.join( '' ) );
				frameCount++;
			}
			// next line
			offset++;
		}
		
		this.frameCount = frameCount;
		this.frame = []; // instanceof BMP
		this.bitmapFilenames = bitmaps;
		
		this._loadBMPFiles();
	},
	
	_loadBMPFiles: function() {
		var n = this.frame.length;
		if( n === this.bitmapFilenames.length ) {
			delete this.bitmapFilenames;
			// because the images have been loaded, we can initialize
			// the width and height variables, which should be the same
			// for all sprite images
			this.width = this.frame[0].width;
			this.height = this.frame[0].height;
			this._loadedCallback.call( this._loadedContext );
		} else {
			// keep loading
			this.frame[n] = new BMP();
			this.frame[n].load( this.bitmapFilenames[n], this._loadBMPFiles, this );
		}
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