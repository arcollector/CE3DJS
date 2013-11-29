/*Engine.Shade.load( 'shade', function() {
	console.log( 'shade palette loaded!' );
} );*/

/*Engine.Textures.loadBT( 'text', function() {
	Engine.Shade.generate( 150, 150, 150, Engine.Textures.tMap[0].palette );
	Engine.Shade.save( 'shade2' );
} );*/

var isTextureLoaded = false;
Engine.Textures.loadBT( 'text', function() {
	Engine.Shade.load( 'shade', function() {
		isTextureLoaded = true;
		if( isWindowLoaded ) {
			main();
		}
	} );
} );

var isWindowLoaded = false;
window.onload = function() {
	isWindowLoaded = true;
	if( isTextureLoaded ) {
		main();
	}
};

var main = function() {
	Engine.Screen.init( Engine.Textures.tMap[0].palette );
	document.body.style.cursor = 'default';
	
	Engine.videoMem = [];
	for( var i = 0; i < 64000; i++ ) {
		Engine.videoMem[i] = 0;
	}
	
	for( m = 0; m < 256*32; m++ ) {
		for( var i = 0; i < 32; i++ ) {
			for( var j = 0; j < 10; j++ ) {
				for( var k = 0; k < 10; k++ ) {
					Engine.videoMem[j*320+k+i*10+m*3200] = Engine.Shade.shade[m*32+i];
				}
			}
		}
	}
	
	Engine.Screen.render( Engine.videoMem );
	
	
};