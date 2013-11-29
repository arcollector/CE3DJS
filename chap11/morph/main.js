////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
	
// create the light
var light = Engine.Light;
light.x = 1000;
light.y = 100;
light.z = 4;

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// create the viewer
var viewer = Engine.Viewer;
viewer.init();

// create a virtual track-ball
var pressed = false;
var px = 0, py = 0;
var lx, ly;
var speedStep = 20;
var updateViewer = function() {
	// get the mouse coordinates and map them to a suitable
	// range
	var x = Math.round( ( Mouse.getX() - 50 ) / 4 );
	var y = Math.round( ( Mouse.getY() - 50 ) / 4 );
	
	// move the view foward by the speedStep
	// this variable is a global, and is used so the player can
	// change the speed of the imanginary aircraft
	viewer.zPos += speedStep;
	
	// if absolutely no buttons are being pressed, we tilt the player based
	// on the Y position of the mouse, turn the player based on the X position
	// of the mouse, and roll the player based on a divided X position
	if( !Mouse.getLb() && !Mouse.getRb() ) {
		// do the rotations
		viewer.xRot += y;
		viewer.yRot += x;
		viewer.zRot += x / 16;
		pressed = false;
		
	// if the right buttons is being pressed, we roll the player, but we do not
	// tilt or turn him or her
	} else if( !Mouse.getLb() && Mouse.getRb() ) {
		// rotate on the z axis
		viewer.zRot -= x;
		pressed = false;
	
	// if both buttons are pressed, we do the texture editing stuff
	} else if( Mouse.getLb() && Mouse.getRb() ) {
		if( !pressed ) {
			pressed = true;
			// record the actual screen coordinates of the
			// mouse pointer
			px = Mouse.getSx();
			py = Mouse.getSy();
			lx = Mouse.getSx();
			ly = Mouse.getSy();
		} else {
			world.moveTexture( px, py, (lx - Mouse.getSx())/4, (ly - Mouse.getSy())/4 );
			lx = Mouse.getSx();
			ly = Mouse.getSy();
		}
		
	// else no button are pressed
	} else {
		pressed = false;
	}
};

var handleKey = function( e ) {
	switch( e.charCode || e.keyCode ) {
		// TAB
		case 9:
			e.preventDefault();
			world.selectNextPolygon();
			break;
		// 't'
		case 84:
			world.nextTexture();
			break;
		// 'r'
		case 82:
			world.rotateTextures();
			break;
		// 'i'
		case 73:
			world.nextIntensity( Mouse.getSx(), Mouse.getSy() );
			break;
		// num pad - and -
		case 109:
		case 189:
			if( speedStep > 0 ) {
				speedStep -= 10;
			}
			break;
		// num pad + and +
		case 107:
		case 187:
			if( speedStep < 50 ) {
				speedStep += 10;
			}
			break;
	}
};

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// create the transformation matrix
var m = new Matrix3D();

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// load world
var world = new Mesh();
var isWorldLoaded = false;
// read the polygons data
world.readBIN( 'test', function() {
	// generate morphing data
	world.morphTo( 'test2', 800, function() {
		// read - if possible - the texture data
		world.readTexture( 'text', function() {
			// initial transform
			m.initialize();
			// raise the viewer
			m.translate( 0, -1000, 0 );
			world.transform( m );
			
			// read - if possible - the shade table
			Engine.Shade.load( 'shade', function() {
				
				isWorldLoaded = true;
				if( isWindowLoaded ) {
					main();
				}
			} );
		} );
	} );
} );

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// register mouse with updateViewer function 
Mouse.init();
// re-map the cursor's coordinates
Mouse.mappingRange( 100, 100 );
// clip the cursor to a rectangular region
Mouse.clip( 5, 5, 95, 95 );
	
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

var isWindowLoaded = false;
window.onload = function() {
	isWindowLoaded = true;
	if( isWorldLoaded ) {
		main();
	}
};

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

var frameCount = 0;
var timer = 0;
var offset = 0;
var loop;
var draw = function( timestamp ) {
	loop = requestAnimationFrame( draw );
	
	timer += timestamp - offset;
	frameCount++;
	if( timer > 1000 ) {
		Engine.Screen.clearText();
		Engine.Screen.echo( frameCount + ' fps', 260, 20 ); 
		frameCount = 0;
		timer = 0;
		offset += 1000;
	}

	updateViewer();
	m.translate( 0, 0, -viewer.zPos );
	m.rotate( -viewer.xRot, -viewer.yRot, -viewer.zRot );
	viewer.clear();
	
	world.transform( m );
	world.display( Engine.videoMem, Engine.zBuffer );
	
	Mouse.display( Engine.videoMem );
	
	// re-draw screen
	Engine.Screen.render( Engine.videoMem );
	
	// clean z buffer
	var ptr = 0;
	for( var i = 0; i < 6400; i++ ) {
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
		Engine.zBuffer[ptr++] = 0;
	}
	// clean screen
	var ptr = 0;
	for( var i = 0; i < 6400; i++ ) {
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
		Engine.videoMem[ptr++] = backgroundColor;
	}
};

var exit = function( e ) {
	if( e.keyCode === 27 ) {
		cancelAnimationFrame( loop );
		// save the texture data
		//world.writeTexture( 'text' );
	}
};

var backgroundColor;
var main = function() {
	
	// init z-buffer
	Engine.zBuffer = [];
	for( var i = 0; i < 64000; i++ ) {
		Engine.zBuffer[i] = 0;
	}

	// init screen
	Engine.videoMem = [];
	// calculate the background color (a shade of whitish-gray)
	backgroundColor = Engine.Shade.getColor( 150, 150, 150, Engine.Textures.tMap[0].palette );
	for( var i = 0; i < 64000; i++ ) {
		Engine.videoMem[i] = backgroundColor;
	}
	
	// init screen with the palette of the first texture
	Engine.Screen.init( Engine.Textures.tMap[0].palette );
	// init keyboard and bind the respective listeners
	Engine.Keyboard.init();
	Engine.Keyboard.bind( exit );
	Engine.Keyboard.bind( handleKey );
	
	draw( 0 );
};