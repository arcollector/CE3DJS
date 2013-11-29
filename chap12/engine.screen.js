Engine.Screen = {

	init: function( palette ) {
		if( !Array.isArray( palette ) ) {
			throw Error( 'you must specifiy a rgba palette of 256 colors!' );
		}
		// disable selecting
		document.onselectstart = function() {
			return false;
		};
		// create the canvas
		this.$canvas = document.createElement( 'canvas' );
		this.$canvas.style.backgroundColor = '#000';
		this.ctx = this.$canvas.getContext( '2d' );
		// resize the body
		var $body = document.querySelector( 'body' );
		$body.style.width = Engine.REAL_WIDTH + 'px';
		$body.style.height = Engine.REAL_HEIGHT + 'px';
		$body.style.overflow = 'hidden';
		$body.style.cursor = 'none';
		// fit canvas to body
		this.$canvas.style.width = '100%';
		this.$canvas.style.height = '100%';
		this.SCREEN_WIDTH = this.$canvas.width = this.$canvas.offsetWidth = Engine.WIDTH;
		this.SCREEN_HEIGHT = this.$canvas.height = this.$canvas.offsetHeight = Engine.HEIGHT;
		this.palette = palette;
		// load canvas into the dom tree
		$body.appendChild( this.$canvas );
	},
	
	_initBuffer: function() {
		this.ctx.clearRect( 0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT );
		this.imageData = this.ctx.getImageData( 0,0, this.SCREEN_WIDTH,this.SCREEN_HEIGHT );
		this.screen = this.imageData.data;
	},
	
	_updateScreen: function() {
		this.ctx.putImageData( this.imageData, 0,0 );
		
		if( this.bufferString.length ) {
			this.ctx.font = 'bold 12px georgia';
			this.ctx.fillStyle = 'green';
			for( var i = 0, l = this.bufferString.length; i < l; i++ ) {
				var string = this.bufferString[i];
				this.ctx.fillText( string.text, string.x, string.y );
			}
		}
	},
	
	setPalette: function( palette ) {
		this.palette = palette;
	},
	
	render: function( vidMem ) {
		this._initBuffer();
		
		var realColor;
		var offset = 0;
		for( var i = 0; i < 64000; i++ ) {
			realColor = this.palette[vidMem[i]];
			if( !realColor ) {
				console.log( 'invalid index color: ', vidMem[i] );
				continue;
			}
			this.screen[offset] = realColor[0];
			offset++;
			this.screen[offset] = realColor[1];
			offset++;
			this.screen[offset] = realColor[2];
			offset++;
			this.screen[offset] = realColor[3];
			offset++;
		}
		
		this._updateScreen();
	},
	
	// store here the string to be echoed
	bufferString: [],
	
	echo: function( text, x, y ) {
		this.bufferString.push( { text: text, x: x, y: y } );
	},
	clearText: function() {
		this.bufferString = [];
	},
	
};