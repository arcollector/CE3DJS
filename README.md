Cutting-Edge-3D-Game-Programming-With-JS
========================================

JS implementation from the book Cutting Edge 3D Game Programming With C++ by John De Goes. 

Although my code is not same from the book, I have changed some filenames, some classnames and of course some variables names. Also because for the nature of how JS handle numeric values (all are float) my code don't use fixed point math, this make my code much more readable.

List of changes
==============

	* polyobj.(h|cpp) filename has been renamed to engine.mesh.js
	* panel3d.(h|cpp) filename has been rename to engine.polygon.js
	* point3d.(h|cpp) filename has been renamed to engine.vector2d.js
	* detail3d.hpp filename has been renamed to engine.vertex.texture.js
	* 3dclass.(h|cpp) filename has been renamed to engine.js
	* linetype.(h|cpp) filename has been renamed to engine.linesegment.js
	* palshade.(h|cpp) filename has been renamed to engine.shade.js
	
helper functions are stored in a separate file with the "helpers" string append to end of the filename.

How to use
===========
You need to setup a web server to run the code examples, I recommend the http-server for nodejs, otherwise, you can also run chrome with the option "allow-file-access-from-files" or in firefox by enabling the option security.fileuri.strict_origin_policy to false in about:config