var mesh = new Mesh();
mesh.readBIN( 'test', function() {
	console.log( mesh );
	mesh.readTexture( 'text', function() {
		console.log( Engine.Textures );
		//mesh.writeTexture( 'text' );

		Engine.Screen.init( Engine.Textures.tMap[0].palette );
		showTextures( 0 );
	} );	
} );

var showTextures = function( n ) {
	Engine.videoMem = [];
	for( var i = 0; i < 64000; i++ ) {
		Engine.videoMem[i] = 0;
	}
	
	var bitmap = Engine.Textures.tMap[n];
	
	var pos = 0;
	var i = 0;
	var offset = Engine.WIDTH - bitmap.width;
	for( var y = 0; y < bitmap.height; y++ ) {
		for( var x = 0; x < bitmap.width; x++ ) {
			Engine.videoMem[pos] = bitmap.image[i];
			pos++;
			i++;
		}
		pos += offset;
	}
	
	Engine.Screen.render( Engine.videoMem );
	
	setTimeout( function() {
		n = (n+1) % Engine.Textures.tCount;
		showTextures( n );
	}, 1000 );
};
