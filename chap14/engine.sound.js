Engine.Sound = {
	
	sounds: {},
	
	load: function( name, src ) {
		this.sounds[name] = new Audio( src );
	},
	
	play: function( name ) {
		var sound = this.sounds[name];
		if( sound ) {
			sound.play();
		}
	}
	
};