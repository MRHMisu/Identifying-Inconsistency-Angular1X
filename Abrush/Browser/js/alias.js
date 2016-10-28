/**
 * Constructor for alias objects
 */

function Alias(original, objectMV) {
	this.original = original;
	this.objectMV = objectMV;
}

/**
 * Returns the object model variable that will be used to dealias the
 * identifier
 */
Alias.prototype.getObjectMV = function() {
	return this.objectMV;
}
