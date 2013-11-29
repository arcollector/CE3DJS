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
var updateViewer = function() {
	// get the mouse coordinates and map them to a suitable
	// range
	var x = Math.round( ( Mouse.getX() - 50 ) / 4 );
	var y = Math.round( ( Mouse.getY() - 50 ) / 4 );
	
	// if the button is pressed
	if( Mouse.getLb() && !Mouse.getRb() ) {
		// do translations and rotations
		viewer.zPos -= y * 5;
		viewer.yRot += x;
		pressed = false;
		
	// else if the right button is pressed
	} else if( !Mouse.getLb() && Mouse.getRb() ) {
		viewer.xRot += y * .1;
		pressed = false;
	
	// else if the right button is pressed
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
world.readBIN( 'test', function() {
	// read - if possible - the texture data
	world.readTexture( 'text', function() {
		// initial transform
		m.initialize();
		// raise the viewer
		m.translate( 0, -500, 0 );
		m.rotate( 0, 450, 0 );
		world.transform( m );
	
		isWorldLoaded = true;
		if( isWindowLoaded ) {
			main();
		}
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

// init z-buffer
Engine.zBuffer = [];
for( var i = 0; i < 64000; i++ ) {
	Engine.zBuffer[i] = 0;
}

// init screen
Engine.videoMem = [];
for( var i = 0; i < 64000; i++ ) {
	Engine.videoMem[i] = 0;
}
	
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
		// background color = 0 (a shade of whitish-gray)
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
		Engine.videoMem[ptr++] = 0;
	}
};

var exit = function( e ) {
	if( e.keyCode === 27 ) {
		cancelAnimationFrame( loop );
		// save the texture data
		//world.writeTexture( 'text' );
	}
};

var main = function() {
	// init screen with the palette of the first texture
	Engine.Screen.init( Engine.Textures.tMap[0].palette );
	// init keyboard and bind the respective listeners
	Engine.Keyboard.init();
	Engine.Keyboard.bind( exit );
	Engine.Keyboard.bind( handleKey );
	
	draw( 0 );
};