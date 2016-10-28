/**
 * Constructor for Controller objects, which are placed in the controllers array
 */

function Controller(name) {
	this.name = name;
	this.modelVariables = new Array();
	this.controllerFunctions = new Array();
}

/**
 * Add a new model variable in the list
 * @param identifier The model variable identifier
 * @param lineNumber The line number where the model variable is used
 * @param editorInstance The editor instance where the model variable is used
 * @param type The assigned type
 */
Controller.prototype.addModelVariable = function(identifier, lineNumber, editorInstance, type) {
	var newModelVariable = new ModelVariable(identifier, lineNumber, editorInstance);
	if (type != undefined) {
		newModelVariable.setType(type);
	}
	this.modelVariables.push(newModelVariable);
};

/**
 * Add a new controller function in the list
 * @param identifier The controller function identifier
 * @param lineNumber The line number where the controller function is defined
 * @param editorInstance The editor instance where the controller function is defined
 * @param type The returned type
 */
Controller.prototype.addControllerFunction = function(identifier, lineNumber, editorInstance, type) {
	var newControllerFunction = new ControllerFunction(identifier, lineNumber, editorInstance);
	if (type != undefined) {
		newControllerFunction.setType(type);
	}
	this.controllerFunctions.push(newControllerFunction);
};

/**
 * Check if the controller already contains a model variable with the specified identifier
 * @param {Object} identifier
 * 			The identifier
 */
Controller.prototype.containsModelVariable = function(identifier) {
	for (var i in this.modelVariables) {
		nextMv = this.modelVariables[i];
		if (nextMv.identifier == identifier) {
			return true;
		}
	}
	return false;
}

/**
 * Updates the type of the model variable with the given identifier, if it exists
 * @param {Object} identifier
 * 			The identifier
 * @param {Object} type
 * 			The new type
 */
Controller.prototype.updateModelVariableType = function(identifier, type) {
	for (var i in this.modelVariables) {
		nextMv = this.modelVariables[i];
		if (nextMv.identifier == identifier) {
			nextMv.setType(type);
			return;
		}
	}
}

/**
 * Updates the type of the controller function with the given identifier, if it exists
 * @param {Object} identifier
 * 			The identifier
 * @param {Object} type
 * 			The new type
 */
Controller.prototype.updateControllerFunctionType = function(identifier, type) {
	for (var i in this.controllerFunctions) {
		nextCf = this.controllerFunctions[i];
		if (nextCf.identifier == identifier) {
			nextCf.setType(type);
			return;
		}
	}
}

/**
 * Retrieves the type of the controller function with the given identifier. If the
 * identifier does not exist, null is returned
 * @param {Object} identifier
 * 			The identifier
 */
Controller.prototype.getControllerFunctionType = function(identifier) {
	for (var i in this.controllerFunctions) {
		nextCf = this.controllerFunctions[i];
		if (nextCf.identifier == identifier) {
			return nextCf.type;
		}
	}
	return null;
}
