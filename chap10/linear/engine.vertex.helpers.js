// function designed to search through "list" in an attempt
// to determine uniqueness of vertex "vector"
Vertex.isVertexRepeated = function( vector, list, range ) {
	// loop through list of vertices
	for( var count = 0; count < range; count++ ) {
		// return true (it's unique)
		if( vector.equalTo( list[count] ) ) {
			return true;
		}
	}
	// if it's not unique return false
	return false;
};

// function designed to search through list in an attempt
// to locate the index of a vertex that matches v
Vertex.getVertIndex = function( vector, list, range ) {
	// loop through the list of vertices
	for( var count = 0; count < range; count++ ) {
		// if vertex matches, return the index
		if( vector.equalTo( list[count] ) ) {
			return count;
		}
	}
	// return zero as default - Note: this code should
	// never be reached
	return 0;
};

