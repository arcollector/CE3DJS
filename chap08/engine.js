var Engine = {

	MINX: 10,
	MAXX: 309,
	MINY: 10,
	MAXY: 189,
	WIDTH: 320,
	HEIGHT: 200,
	XCENTER: 160,
	YCENTER: 100,
	MINZ: 100,
	MAXZ: 10000,
	XSCALE: 120,
	YSCALE: -120,
	
	COLOR_RANGE: 255,
	COLOR_START: 0,
	
	REAL_WIDTH: document.documentElement.clientWidth,
	REAL_HEIGHT: document.documentElement.clientHeight,
	
	zBuffer: null,
	screen: null
};