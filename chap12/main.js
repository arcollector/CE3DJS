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

var pressed = false;
var px = 0, py = 0;
var lx, ly;
// create a virtual track-ball
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
		viewer.xRot += y * 5;
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
		// 'i'
		case 73:
			world.nextIntensity( Mouse.getSx(), Mouse.getSy() );
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
var monster;
var isWorldLoaded = false;
// read the polygons data
world.readBIN( 'test.bin', function() {
	// read - if possible - the texture data
	world.readTexture( 'text.bt', function() {
		// read - if possible - the shade table
		Engine.Shade.load( 'shade.tab', function() {
			// load monster
			monster = new Monster( 0, 400, 2000, 'mon.ini', function() {
			
				// initial transform
				m.initialize();
				// raise the viewer
				m.translate( 0, -Engine.VIEW_HEIGHT, -500 );
				world.transform( m );
			
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

var isLooking = false;
var copy = new Matrix3D();
var oldXRot = 0;
var monsterFrameCount = 0;
var monsterFrameNum = 0;
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
	
	// we check to see if the player is looking up or down by
	// examining the state of the x axis rotation
	if( viewer.xRot !== 0 ) {
		// if the player has not been looking, we set the falg
		// isLooking to true and copy the current matrix
		if( !isLooking ) {
			isLooking = true;
			m.copyTo( copy );
		}
		// we rotate the player on the X axis back to his o her
		// former rotation, if any. this former rotation is stored
		// in the variable oldXRot
		m.rotate( oldXRot, 0, 0 );
		// next, we rotate the player on the x axis to his new rotation
		m.rotate( -viewer.xRot, 0, 0 );
		// we store the value we just rotated the player to in
		// the variable oldXRot
		oldXRot = viewer.xRot;
		
		// in the above bit of source code, we didn't have to rotate the
		// player on the x axis back to his former rotation. However, by
		// doing this two-step process, we can make it so that right
		// clicking on area rotates the player to see that area. if we
		// didn't do this, right clicking would continuously rotate the view
		// on the x axis
		
	// if the player isn't rotating
	} else {
	
		// if the player happened to be rotating the last frame
		// (ie: the isLooking flag is true), we use the copy of the matrix
		// to restore the player's former rotation, and set the isLooking
		// flag to false
		if( isLooking ) {
			isLooking = false;
			copy.copyTo( m );
		}
		// simulate gravity
		viewer.yPos = -100;
		
		// perform collision detection
		// we set the viewer's radius at 100 units
		var res = world.collide( viewer.xPos, viewer.yPos, viewer.zPos, 100 );
		viewer.xPos = res[0];
		viewer.yPos = res[1];
		viewer.zPos = res[2];

		// update the world
		m.translate( -viewer.xPos, -viewer.yPos, -viewer.zPos );
		m.rotate( 0, -viewer.yRot, 0 );

		oldXRot = 0;
	}
	viewer.clear();
	
	// move the monster toward the player in 100 steps
	monster.moveToward( 0, 0, 0, 100, m );
	
	// change (if necessary) to the next monster frame
	if( (monsterFrameCount % 4) === 0 ) {
		++monsterFrameNum;
		// if the monster is very close, we animate the last set
		// of the images, which show the skeleton in a fighting stance
		if( monster.dist() > 900 ) {
			if( monsterFrameNum > 8 ) {
				monsterFrameNum = 0;
			}
		// if the skeleton had been in a fighting stance (the frame number
		// tells us this), but is no longer, we set the frame to some value in
		// the "walking" sequence
		} else {
			if( monsterFrameNum > 11 ) {
				monsterFrameNum = 9;
			}
		}
		// finally, we actually change the currently selected sprite frame
		monster.setFrameNum( monsterFrameNum );
	}
	
	world.transform( m );
	world.display( Engine.videoMem, Engine.zBuffer );
	
	monster.show( m, Engine.videoMem, Engine.zBuffer );
	
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