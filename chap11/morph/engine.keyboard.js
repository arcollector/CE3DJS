Engine.Keyboard = {

	listeners: [],
	
	init: function() {
		document.onkeydown = this._handle.bind( this );
	},
	
	_handle: function( e ) {
		for( var i = 0, l = this.listeners.length; i < l; i++ ) {
			this.listeners[i].callback.call( this.listeners[i].context, e );
		}
	},
	
	bind: function( callback, context ) {
		this.listeners.push( { callback: callback, context: context || window } );
	}
	
};