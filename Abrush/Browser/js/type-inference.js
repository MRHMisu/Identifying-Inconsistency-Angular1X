/**
 * Module for inferring types
 */

var treeBuilder = null; //Helper member used to build a nested object tree

/**
 * Determines the assigned type, or returns a model variable
 * tree if the assigned type is ObjectExpression. The output is an
 * object expression containing the following properties:
 * 
 * type - the inferred type (could be 'unknown')
 * isTree - boolean that indicates that a nested object has been extracted
 * tree - the nested object tree
 * 
 * @param {Object} assignedValue
 * 			JSON representing the assigned value
 * @param {Object} identifier
 * 			The identifier of the model variable to which the value is assigned
 * @param {Object} lineNumber
 * 			The line number of the model variable to which the value is assigned
 * @param {Object} editorInstance
 * 			The editor instance ocntaining the model variable to which the value is assigned
 */
function inferAssignedType(assignedValue, identifier, lineNumber, editorInstance) {
	var returnValue = {
		type: IdType.UNKNOWN,
		isTree: false,
		tree: null
	};
	
	if (assignedValue.type == 'Literal') {
		returnValue.type = inferAssignedLiteralType(assignedValue.value);
	}
	else if (assignedValue.type == 'ObjectExpression') {
		//Handle nested objects
		treeBuilder = new ModelVariable(identifier, lineNumber, editorInstance);
		treeBuilder.setType('object');
		extractNestedObjectTree(assignedValue, treeBuilder);
		returnValue.tree = treeBuilder;
		returnValue.isTree = true;
		returnValue.type = 'object';
	}
	
	//TODO: Handle simple cases when inferring types, like string concatenations
	
	return returnValue;
}

/**
 * Determines the returned type
 * 
 * @param {Object} assignedValue
 * 			JSON representing the assigned value
 * @param {Object} identifier
 * 			The identifier of the model variable to which the value is assigned
 * @param {Object} lineNumber
 * 			The line number of the model variable to which the value is assigned
 * @param {Object} editorInstance
 * 			The editor instance ocntaining the model variable to which the value is assigned
 * @returns string indicating the type
 */
function inferReturnedType(returnedValue) {
	var inferredType = IdType.UNKNOWN;
	if (returnedValue.type == 'Literal') {
		inferredType = inferAssignedLiteralType(returnedValue.value);
	}
	
	return inferredType;
}

/**
 * Extracts the model variable tree from the nested object by performing
 * a (recursive) depth-first search
 * @param {Object} assignedValue
 * 			JSON representing the nested object
 * @param {Object} mvNode
 * 			Current model variable node whose children need to be explored
 */
function extractNestedObjectTree(assignedValue, mvNode) {
	var properties = assignedValue.properties;
	for (var idx in properties) {
		var property = properties[idx];
		if (property.key.type == 'Identifier') {
			newNode = new ModelVariable(property.key.name, property.loc.start.line, mvNode.editorInstance);
			
			mvNode.addChildModelVariable(newNode);
			
			//Infer type of new model variable within nested object
			if (property.value.type == 'Literal') {
				newNode.setType(inferAssignedLiteralType(property.value.value));
			}
			else if (property.value.type == 'ObjectExpression') {
				newNode.setType('object');
				extractNestedObjectTree(property.value, newNode);
			}
		}
	}
}

/**
 * Infers the assigned type, if the assigned value has been determined
 * to be a literal. This can also be used for finding returned types
 * @param {Object} value
 * 			JSON representing the assigned value
 */
function inferAssignedLiteralType(value) {
	if (typeof value == 'number') {
		return IdType.NUMBER;
	}
	else if (typeof value == 'string') {
		return IdType.STRING;
	}
	else if (typeof value == 'boolean') {
		return IdType.BOOLEAN;
	}
	else {
		return IdType.UNKNOWN;
	}
}

IdType = {
	UNKNOWN: 'unknown',
	MIX: 'mix', //Used for multiple assigned types to model variables in a controller
	NA: 'na',
	NUMBER: 'number',
	STRING: 'string',
	BOOLEAN: 'boolean'
};
