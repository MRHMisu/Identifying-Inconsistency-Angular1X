/**
 * Constructor for Model objects, which are placed in the models array
 */

function Model(name) {
	this.name = name;
	this.modelVariables = new Array();
}

/**
 * Add a new model variable in the list
 * @param identifier The model variable identifier
 * @param lineNumber The line number where the model variable is defined
 * @param editorInstance The editor instance where the model variable is defined
 * @param type The assigned type
 */
Model.prototype.addModelVariable = function(identifier, lineNumber, editorInstance, type) {
	var newModelVariable = new ModelVariable(identifier, lineNumber, editorInstance);
	if (type != undefined) {
		newModelVariable.setType(type);
	}
	this.modelVariables.push(newModelVariable);
};

/**
 * Add a new model variable, in tree form (to represent nested objects)
 * @param {Object} mvtree The model variable tree
 */
Model.prototype.addModelVariableTree = function(mvtree) {
	this.modelVariables.push(mvtree);
};
