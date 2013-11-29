Cutting-Edge-3D-Game-Programming-With-JS
========================================

JS implementation from the book *Cutting Edge 3D Game Programming With C++* by *John De Goes*. 

Although my code is not same from the book, I have changed some filenames, some classnames and of course some variables names. Also because for the nature of how JS handle numeric values (all are float by nature) my code don't use fixed point math, this make my code much more readable.

List of changes
===============

	polyobj.(h|cpp) filename has been renamed to engine.mesh.js
	panel3d.(h|cpp) filename has been rename to engine.polygon.js
	point3d.(h|cpp) filename has been renamed to engine.vector2d.js
	detail3d.hpp filename has been renamed to engine.vertex.texture.js
	3dclass.(h|cpp) filename has been renamed to engine.js
	linetype.(h|cpp) filename has been renamed to engine.linesegment.js
	palshade.(h|cpp) filename has been renamed to engine.shade.js
	
Helper functions are stored in a separate file with the `helpers` string append to end of the filename.

How to use
===========
You need to setup a web server to run the code examples, I recommend `http-server` for nodejs, otherwise, you can also run chrome with the option `allow-file-access-from-files` or in firefox by enabling the option `security.fileuri.strict_origin_policy` to `false` in `about:config`

About the engine
================
The engine only works with quad polygons, if you want to use triangle polygons you need to repeat some vertex in order to get a quad. Second, the engine only works with `DXF` files, any 3D modeler software support this format, but the problem is that the DXF file must be a `quad mesh based`, you will noted this by opening the file and looking for `3D FACE` section(s), if the DXF file don't contain this section(s), then you have triangle based mesh, which it isn't gone work with this engine.

The other problem is that the engine only works properly if the vertices that compound a face from the mesh are specified in `clockwise order`, so although if you have DXF quad based mesh file, is highly probable that the vertices are stored in `counter-clockwise order`, which again it won't work this engine.

And lastly is the texturing mapping, the engine only works with `256 color bitmap BMP` files, any paint program support this type of BMP format, so this will not a problem for you.

Things that I've left out
==========================

***Fixed point math:***
For obvious reasons.

***Frame coherence:***
This states that if an object is invisible it will keep invisible for a couple of frames, although, this sounds nice, in practice it don't work properly.

***Clear reduction:***
The engine implements a z-buffer of 1/z values, this add the possiblity to add a certain amount of " a translation value" until the 1/z values overflow, with this approeach, you can hold on the clearing of the z buffer a couple of frames, instead of clearing it every frame, but again in practice this only make your code uglier.
