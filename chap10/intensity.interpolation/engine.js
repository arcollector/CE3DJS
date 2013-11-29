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
	
	REAL_WIDTH: document.documentElement.clientWidth,
	REAL_HEIGHT: Math.max( document.documentElement.clientHeight, document.documentElement.clientHeight ),
	
	zBuffer: null,
	videoMem: null,
};