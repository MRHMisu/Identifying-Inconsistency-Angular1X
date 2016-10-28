/**
 * Constructor for the controller function objects
 */

function ControllerFunction(identifier, lineNumber, editorInstance) {
	this.identifier = identifier;
	this.lineNumber = lineNumber;
	this.editorInstance = editorInstance;
	
	this.type = IdType.NA;
}

/**
 * Set either the returned or expected type for this controller function. 
 * If no expected type, assign "na". If returned type cannot be inferred,
 * assign "unknown"
 * @param ty
 * 		The type
 */
ControllerFunction.prototype.setType = function(ty) {
	this.type = ty;
};
