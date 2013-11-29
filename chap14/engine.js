var Engine = {

	MINX: 0,
	MAXX: 320,
	MINY: 0,
	MAXY: 200,
	WIDTH: 320,
	HEIGHT: 200,
	XCENTER: 160,
	YCENTER: 100,
	MINZ: 100,
	MAXZ: 3000,
	XSCALE: 120,
	YSCALE: -120,
	
	COLOR_RANGE: 8,
	COLOR_START: 8,
	COLOR_COUNT: 256,
	SHADE_COUNT: 32,
	SHADE_DIV: ( 3000 - 100 ) / 32,
	
	REAL_WIDTH: window.innerWidth,
	REAL_HEIGHT: window.innerHeight,
	
	// the NOSE constant describes the closest distance to any wall
	// that we can reach before we "collide" with it
	NOSE: 300,
	// the VIEW_HEIGHT constant represents the height of the viewer
	VIEW_HEIGHT: 700,
	
	zBuffer: null,
	videoMem: null,
};