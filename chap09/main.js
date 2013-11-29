var generatePalette = function() {
	// generate the palette
	var scale;
	var colors = [];
	for( var n = 0; n < 256; n++ ) {
		scale = Math.round( 255/63 * ( n >> 2 ) );
		colors[n] = [ scale, scale, scale, 255 ];
	}
	return colors;
};

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
		
	// else if the right button is pressed
	} else if( !Mouse.getLb() && Mouse.getRb() ) {
		viewer.xRot += y * .1;
		viewer.zRot -= x * .1;
	}
};

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// create the transformation matrix
var m = new Matrix3D();
m.initialize();
// raise the viewer
m.translate( 0, -600, 0 );

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// load world
var world = new Mesh();
var isWorldLoaded = false;
world.readBIN( 'test', function() {
	// initial transform
	world.transform( m );
	isWorldLoaded = true;
	if( isScreenLoaded ) {
		main();
	}
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
Engine.screen = [];
for( var i = 0; i < 64000; i++ ) {
	Engine.screen[i] = 1;
}
	
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

var isScreenLoaded = false;
window.onload = function() {
	// show the screen
	Screen.init( generatePalette() );
	
	isScreenLoaded = true;
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
var draw = function( timestamp ) {
	requestAnimationFrame( draw );
	
	timer += timestamp - offset;
	frameCount++;
	if( timer > 1000 ) {
		Screen.clearText();
		Screen.echo( frameCount + ' fps', 260, 20 ); 
		frameCount = 0;
		timer = 0;
		offset += 1000;
	}

	updateViewer();
	m.translate( 0, 0, -viewer.zPos );
	m.rotate( -viewer.xRot, -viewer.yRot, -viewer.zRot );
	viewer.clear();
	
	world.transform( m );
	world.display( Engine.screen, Engine.zBuffer );
	
	Mouse.display( Engine.screen );
	
	// re-draw screen
	Screen.render( Engine.screen );
	
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
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
		Engine.screen[ptr++] = 1;
	}
};

var main = function() {
	draw( 0 );
};