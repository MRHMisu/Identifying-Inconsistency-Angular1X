/**
 * Constructor for the model variable objects
 */

function ModelVariable(identifier, lineNumber, editorInstance) {
	this.identifier = identifier;
	this.lineNumber = lineNumber;
	this.editorInstance = editorInstance;
	
	this.childModelVariables = [];
	this.type = IdType.UNKNOWN;
	
	this.aliases = [];
}

/**
 * Get the sequence in the identifier, translated from dot notation.
 * For example, x.y.z translates to x --> y --> z
 */
ModelVariable.prototype.getSequence = function() {
	return this.identifier.split(".");
};

/**
 * Set either the assigned or expected type for this model variable. If
 * no expected type, assign "na". If assigned type cannot be inferred,
 * assign "unknown"
 * @param ty
 * 		The type
 */
ModelVariable.prototype.setType = function(ty) {
	this.type = ty;
};

/**
 * Adds a child model variable to this model variable's list
 * @param {Object} mv
 */
ModelVariable.prototype.addChildModelVariable = function(mv) {
	this.childModelVariables.push(mv);
};

/**
 * Sets the list of aliases
 * @param {Object} aliases
 * 			The list of aliases
 */
ModelVariable.prototype.setAliases = function(aliases) {
	for (var i = 0; i < aliases.length; i++) {
		this.aliases.push(aliases[i]);
	}
}
