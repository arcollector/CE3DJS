var Mouse = {
	bitmap: [
		0, 0, 0, 0, 0,17,17, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,18,18, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,19,19, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,20,20, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,21,21, 0, 0, 0, 0, 0,
		17,18,19,20,21,22,22,21,20,19,18,17,
		17,18,19,20,21,22,22,21,20,19,18,17,
		0, 0, 0, 0, 0,21,21, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,20,20, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,19,19, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,18,18, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,17,17, 0, 0, 0, 0, 0,
	],
	height: 12,
	width: 12,
	
	rangeX: Engine.WIDTH,
	rangeY: Engine.HEIGHT,
	
	x: 0,
	y: 0,
	
	leftB: false,
	rightB: false,

	clipFlag: false,
	x1: null,
	y1: null,
	x2: null,
	y2: null,
	
	init: function() {
		/*document.body.onclick = this._register;*/
		
		// Hook pointer lock state change events
		document.addEventListener( 'mousemove', this.updatePos.bind( this ), false );
		document.addEventListener( 'mouseup', this.resetButtonsStatus.bind( this ), false );
		document.addEventListener( 'mousedown', this.checkButtonsStatus.bind( this ), false );
		document.addEventListener( 'contextmenu', function( e ) { e.preventDefault(); }, false );
	},
	
	_register: function( e ) {
		this.requestPointerLock = this.requestPointerLock || this.mozRequestPointerLock || this.webkitRequestPointerLock;
		this.requestPointerLock();
	},
	
	getLb: function() {
		return this.leftB;
	},
	
	getRb: function() {
		return this.rightB;
	},
	
	getX: function() {
		if( this.mapFlag ) {
			return this.x * this.rangeX / Engine.WIDTH;
		}
		return this.x;
	},
	
	getY: function() {
		if( this.mapFlag ) {
			return this.y * this.rangeY / Engine.HEIGHT;
		}
		return this.y;
	},
	
	checkButtonsStatus: function( e ) {
		if( e.buttons ) {
			this.leftB = e.buttons === 1;
			this.rightB = e.buttons === 2;
		} else {
			this.leftB = e.button === 0;
			this.rightB = e.button === 2;
		}
	},
	
	resetButtonsStatus: function( e ) {
		this.leftB = false;
		this.rightB = false;
	},
	
	updatePos: function( e ) {
		// get the mouse coordinates and map them to a suitable
		// range
		/*var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
			movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		
		this.movementX = movementX;
		this.movementY = movementY;*/
		
		this.x = Math.round( Engine.WIDTH / Engine.REAL_WIDTH * e.clientX );
		this.y = Math.round( Engine.HEIGHT / Engine.REAL_HEIGHT * e.clientY );
		if( this.clipFlag ) {
			if( this.x < this.x1 ) {
				this.x = this.x1;
			}
			if( this.x > this.x2 ) {
				this.x = this.x2;
			}
			if( this.y < this.y1 ) {
				this.y = this.y1;
			}
			if( this.y > this.y2 ) {
				this.y = this.y2;
			}
		}
	},
	
	clipPoint: function( sx, sy ) {
		if( sx < 0 ) {
			sx = 0;
		} else if( sx > Engine.WIDTH ) {
			sx = Engine.WIDTH;
		}
		
		if( sy < 0 ) {
			sy = 0;
		} else if( sy > Engine.HEIGHT ) {
			sy = Engine.HEIGHT;
		}
		
		return [ sx, sy ];
	},
	
	mappingRange: function( xRange, yRange ) {
		this.mapFlag = 1;
		this.rangeX = xRange;
		this.rangeY = yRange;
		
		if( this.correctIfMap ) {
			this.correctIfMap = 0;
			this.correctClip( this.x1, this.y1, this.x2, this.y2 );
		}
	},
	
	clip: function( left, top, right, bottom ) {
		this.clipFlag = 1;
		if( this.mapFlag ) {
			this.correctClip( left, top, right, bottom );
		} else {
			this.correctIfMap = 1;
			this.x1 = left;
			this.x2 = right;
			this.y1 = top;
			this.y2 = bottom;
		}
	},
	
	correctClip: function( left, top, right, bottom ) {
		this.x1 = left * Engine.WIDTH / this.rangeX;
		this.x2 = right * Engine.WIDTH / this.rangeX;
		this.y1 = top * Engine.HEIGHT / this.rangeY;
		this.y2 = bottom * Engine.HEIGHT / this.rangeY;
	},
	
	display: function( screen ) {
		var hWidth = this.width / 2;
		var hHeight = this.height / 2;
		var xc = this.x;
		var yc = this.y;
		var left = xc - hWidth;
		var right = xc + hWidth;
		var top = yc - hHeight;
		var bottom = yc + hHeight;
		var res = this.clipPoint( left, top );
		left = res[0];
		top = res[1];
		res = this.clipPoint( right, bottom );
		right = res[0];
		bottom = res[1];
		var cPtr = 0;
		for( var yp = top; yp < bottom; yp++ ) {
			var lPtr = yp * Engine.WIDTH + left;
			for( var xp = left; xp < right; xp++ ) {
				if( this.bitmap[cPtr] ) {
					screen[lPtr] = this.bitmap[cPtr];
				}
				lPtr++;
				cPtr++;
			}
		}
	}
};