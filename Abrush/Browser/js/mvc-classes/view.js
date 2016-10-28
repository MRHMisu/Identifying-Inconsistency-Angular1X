/**
 * Constructor for View objects, which are placed in the views array
 */

function View(name, mc) {
	this.name = name;
	this.modelVariables = new Array();
	this.controllerFunctions = new Array();
	this.mc = mc; //This refers to the identifier of the model/controller that the view is tied to via ng-controller (null if none)
}

/**
 * Add a new model variable in the list
 * @param identifier The model variable identifier
 * @param lineNumber The line number where the model variable is used
 * @param editorInstance The editor instance where the model variable is used
 * @param type The expected type
 */
View.prototype.addModelVariable = function(identifier, lineNumber, editorInstance, type) {
	var newModelVariable = new ModelVariable(identifier, lineNumber, editorInstance);
	if (type != undefined) {
		newModelVariable.setType(type);
	}
	this.modelVariables.push(newModelVariable);
};

/**
 * Add a new controller function in the list
 * @param identifier The controller function identifier
 * @param lineNumber The line number where the controller function is used
 * @param editorInstance The editor instance where the controller function is used
 * @param type The expected type
 */
View.prototype.addControllerFunction = function(identifier, lineNumber, editorInstance, type) {
	var newControllerFunction = new ControllerFunction(identifier, lineNumber, editorInstance);
	if (type != undefined) {
		newControllerFunction.setType(type);
	}
	this.controllerFunctions.push(newControllerFunction);
};

/**
 * Set the list of aliases for a model variable having the given
 * identifier
 * @param {Object} identifier
 * 			The model variable's identifier
 * @param {Object} aliases
 * 			The list of aliases
 */
View.prototype.setAliases = function(identifier, aliases) {
	for (var i = 0; i < this.modelVariables.length; i++) {
		nextMv = this.modelVariables[i];
		if (nextMv.identifier == identifier) {
			nextMv.setAliases(aliases);
		}
	}
}

/**
 * Returns the model variable with the given identifier
 * @param {Object} identifier
 * 			The identifier
 */
View.prototype.getModelVariable = function(identifier) {
	for (var i = 0; i < this.modelVariables.length; i++) {
		nextMv = this.modelVariables[i];
		if (nextMv.identifier == identifier) {
			return nextMv;
		}
	}
}
