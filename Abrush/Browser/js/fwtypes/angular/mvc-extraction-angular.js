/**
 * Extracts models, views, and controllers from the AST and the DOM, assuming that the framework being used
 * is AngularJS
 */

/**
 * Extracts the MVC and routing info from the AST object. This is a 
 * helper function to extractMVC, and it assumes the framework used 
 * is AngularJS
 * @param {Object} astObj
 * 			The AST object
 * @param editorInstance
 * 			The index of the editor instance
 */
function extractMVCFromAst_Angular(astObj, editorInstance) {
	var filename = astObj.filename;
	var theAst = astObj.ast;
	
	//Find all instances of CallExpression and determine if you can get model variables and controller
	//functions from there
	estraverse.traverse(theAst, {
		enter: function(node) {
			if (node.type === 'CallExpression') {
				var callee = node.callee;
				if (callee == undefined || callee.property == undefined || 
						callee.property.type == undefined || callee.property.type != 'Identifier' ||
						callee.property.name == undefined || callee.property.name != 'controller') {
					return;	
				}
				
				//If the above conditions are met, along with the conditions below, get the name
				var arguments = node.arguments;
				if (arguments != undefined && arguments[0] != undefined && arguments[0].type != undefined &&
						arguments[0].type == 'Literal' && arguments[0].value != undefined &&
						arguments[1] != undefined && arguments[1].type != undefined &&
						arguments[1].type == 'FunctionExpression' && arguments[1].body != undefined &&
						arguments[1].body.body != undefined) {
					//Create new model and controller objects
					var name = arguments[0].value;
					var newModel = new Model(name);
					var newController = new Controller(name);
					
					var body = arguments[1].body.body; //Two bodies, because inner body is assumed to be a block statement
					
					//Loop through each child of body to find model variables and controller functions
					//Only ExpressionStatements are considered
					for (i in body) {
						var child = body[i];
						if (child.type == 'ExpressionStatement' && child.expression.type == 'AssignmentExpression' &&
								child.expression.left.type == 'MemberExpression' &&
								child.expression.left.object.name == '$scope') {
							//Get the identifier from the left
							var identifier = child.expression.left.property.name;
							
							if (child.expression.right.type == 'FunctionExpression') {
								extractCFFromAssignment(child, identifier, editorInstance, newController);
							}
							else {
								extractMVFromAssignment(child, identifier, editorInstance, newModel);
							}	
						}
						else {
							//Traverse whatever is inside child to see if there are any assignments (e.g., in if statements, etc.)
							estraverse.traverse(child, {
								enter: function(nodeInChild) {
									if (nodeInChild.type == 'ExpressionStatement' && nodeInChild.expression.type == 'AssignmentExpression' &&
											nodeInChild.expression.left.type == 'MemberExpression' &&
											nodeInChild.expression.left.object.name == '$scope') {
										//Get the identifier from the left
										var identifier = nodeInChild.expression.left.property.name;
										
										if (nodeInChild.expression.right.type == 'FunctionExpression') {
											extractCFFromAssignment(nodeInChild, identifier, editorInstance, newController);
										}
										else {
											extractMVFromAssignment(nodeInChild, identifier, editorInstance, newModel);
										}
									}
								}
							});
						}
					}
					
					models.push(newModel);
					controllers.push(newController);
				}
			}
		}
	});
	
	//Find router code
	extractRouters_Angular(theAst);
}

/**
 * Extracts the model variable from an assignment expression
 * @param assnNode
 * 		The assignment node
 * @param identifier
 * 		The identifier inferred for the model variable
 * @param editorInstance
 * 		The editor instance
 * @param newModel
 * 		The model object
 */
function extractMVFromAssignment(assnNode, identifier, editorInstance, newModel) {
	console.log("MV From Assignment: " + identifier)
	//Add in the model object
	var lineNumber = assnNode.loc.start.line;
	var mvType = IdType.UNKNOWN;
	
	//Determine the assigned type, if possible
	var rightSide = assnNode.expression.right;
	var assignedType = inferAssignedType(rightSide, identifier, lineNumber, editorInstance);
	if (assignedType.isTree) {
		newModel.addModelVariableTree(assignedType.tree);
		return newModel;
	}
	else {
		mvType = assignedType.type;
		newModel.addModelVariable(identifier, lineNumber, editorInstance, mvType);
		return newModel;
	}
}

/**
 * Extracts controller functions from an assignment expression, as well as the model
 * variables it uses
 * @param assnNode
 * 		The assignment node
 * @param
 * 		The identifier inferred for the controller function
 * @param editorInstance
 * 		The editor instance
 * @param newController
 * 		The controller object
 */
function extractCFFromAssignment(assnNode, identifier, editorInstance, newController) {
	//Add in the controller object
	var lineNumber = assnNode.loc.start.line;
	newController.addControllerFunction(identifier, lineNumber, editorInstance);
	
	//Find the model variables used in the function
	var enclosingFunc = assnNode.expression.right.body; //We'll include the entire Block when traversing to ensure there's only one root
	estraverse.traverse(enclosingFunc, {
		enter: function(nodeInFunc, parent) { //Use nodeInFunc to avoid confusion
			if (nodeInFunc.type === 'MemberExpression') {
				if (parent != null && parent != undefined && parent.type == 'AssignmentExpression' && parent.left == nodeInFunc) {
					//If this is part of the left-hand-side of an assignment, then disregard
					return;
				}
				
				if (nodeInFunc.object.type == 'Identifier' && 
						nodeInFunc.object.name == '$scope' &&
						nodeInFunc.property.type == 'Identifier') {
					if (parent != null && parent != undefined && parent.type == 'MemberExpression' && parent.property.type == 'Identifier') {
						return;
					}
					if (parent != null && parent != undefined && parent.type == 'CallExpression' && parent.callee == nodeInFunc) {
						return;
					}
					
					newController.addModelVariable(nodeInFunc.property.name, nodeInFunc.loc.start.line, editorInstance, IdType.UNKNOWN);
				}
				else if (isDotNotationIdentifier(nodeInFunc, parent)) {
					var dotNotation = getDotNotationIdentifier(nodeInFunc, parent);
					if (dotNotation != null && !newController.containsModelVariable(dotNotation)) {
						newController.addModelVariable(dotNotation, nodeInFunc.loc.start.line, editorInstance, IdType.UNKNOWN);
					}
				}
				
				//TODO: Infer assigned type to model variables in controller (one way you can do this is by having
				//an extra else if statement here looking for AssignmentExpressions. If the right side has an inferrable
				//type and the left side is a valid model variable, take note. If the model variable has already been
				//previously encountered in this controller, AND this model variable's type is unknown, mark the type with
				//the inferred assigned type. If the model variable has already been previously encountered in this
				//controller, AND this model variable's type is not unknown, mark the type with "mix". If the model variable
				//has not previously been encountered, place it in a queue so that when the model variable does get encountered
				//in this "MemberExpression" if statement, the type will be set accordingly.)
			}
			else if (nodeInFunc.type === 'ReturnStatement') {
				//All return statements must match types. Otherwise, say "unknown"
				var returnExpression = nodeInFunc.argument;
				if (returnExpression == null) { //Empty return statement
					return;
				}
				var cfType = IdType.UNKNOWN;
				
				var returnedType = inferReturnedType(returnExpression);
				var oldType = newController.getControllerFunctionType(identifier)
				if (oldType != null && oldType != IdType.UNKNOWN) {
					if (oldType == IdType.NA) {
						newController.updateControllerFunctionType(identifier, returnedType);
					}
					else if (oldType != returnedType) {
						newController.updateControllerFunctionType(identifier, IdType.UNKNOWN);
					}
				}
			}
		}
	});
}

/**
 * Extracts the MVC info from the DOM object. This is a helper function
 * to extractMVC, and it assumes the framework used is AngularJS. 
 * This method inherently assumes that each HTML file is tied to one 
 * and only one view
 * @param {Object} domObj
 * 			The DOM object
 * @param editorInstance
 * 			The index of the editor instance
 */
function extractMVCFromDom_Angular(domObj, editorInstance) {
	var filename = domObj.filename;
	var theDom = domObj.dom;
	
	var mcElement = theDom.querySelector("[ng-controller]");
	var mc = null;
	if (mcElement != null) {
		mc = mcElement.getAttribute("ng-controller");
	}
	
	var newView = new View(filename, mc);
	
	//Find all the model variables used
	var aliases = [];
	visitNode_Angular(theDom, editorInstance, newView, aliases, theDom)
	
	views.push(newView);
}

/**
 * Extracts routers from the AST
 * @param {Object} theAst
 * 			The AST in JSON format
 */
function extractRouters_Angular(theAst) {
	estraverse.traverse(theAst, {
		enter: function(node) {
			if (node.type === 'CallExpression') {
				var callee = node.callee;
				if (callee == undefined || callee.property == undefined || 
						callee.property.type == undefined || callee.property.type != 'Identifier' ||
						callee.property.name == undefined || callee.property.name != 'when') {
					return;	
				}
				
				//If the above conditions are met, along with the conditions below, get the object
				//representing the controller and templateUrl values
				var arguments = node.arguments;
				if (arguments != undefined && arguments[1] != undefined && arguments[1].type != undefined &&
						arguments[1].type == 'ObjectExpression' && arguments[1].properties != undefined) {
					//Now, check if the object expression contains the properties controller and templateUrl
					var foundControllerProp = false;
					var foundTemplateUrlProp = false;
					var controllerProp = '';
					var templateUrlProp = '';
					for (i in arguments[1].properties) {
						var property = arguments[1].properties[i];
						if (property.key.type == 'Identifier' && property.key.name == 'controller' 
								&& property.value.type == 'Literal' && property.value.value != undefined
								&& typeof property.value.value == 'string') {
							controllerProp = property.value.value;
							foundControllerProp = true;		
						}
						else if (property.key.type == 'Identifier' && property.key.name == 'templateUrl' 
								&& property.value.type == 'Literal' && property.value.value != undefined
								&& typeof property.value.value == 'string') {
							templateUrlProp = property.value.value;
							foundTemplateUrlProp = true;
						}
					}
					
					if (foundControllerProp && foundTemplateUrlProp) {
						routers.push({
							controller: controllerProp,
							templateUrl: templateUrlProp
						});
					}
				}
			}
		}
	});
}

/**
 * Determines if the AST rooted at node represents a dot notation-formed model
 * variable that starts with "$scope". It is assumed that node is a MemberExpression
 * object
 * @param {Object} node
 * 			The root node
 * @param {Object} parent
 * 			The parent of node in the complete AST
 */
function isDotNotationIdentifier(node, parent) {
	//Check the parent first to see if it's a MemberExpression object that contains an
	//Identifier
	if (parent != null && parent != undefined && parent.type == 'MemberExpression' && parent.property.type == 'Identifier') {
		return false;
	}
	
	if (node.property.type != 'Identifier') {
		return false;
	}
	
	//Now, check if the MemberExpression rooted at node contains "$scope" at the leaf
	var nextChild = node.object;
	while (nextChild.type == 'MemberExpression' && nextChild.property.type == 'Identifier') {
		nextChild = nextChild.object;
	}
	
	if (nextChild.type == 'Identifier' && nextChild.name == '$scope') {
		return true;
	}
	else {
		return false;
	}
}

/**
 * Get the string representing the dot-notation identifier, with the "$scope"
 * portion removed. If anything goes wrong, null is returned. Assumes that node
 * has already undergone the sanity check via isDotNotationIdentifier().
 * @param {Object} node
 * 			The root node
 * @param {Object} parent
 * 			The parent of node in the complete AST
 */
function getDotNotationIdentifier(node, parent) {
	var prefix = "$scope."
	var dotNotation = escodegen.generate(node);
	if (dotNotation.indexOf(prefix) != 0 && dotNotation.length <= prefix.length) {
		return null;
	}
	else {
		var noPrefixIdentifier = dotNotation.substring(prefix.length);
		
		//Check each part of the identifier first to make sure we're not considering any functions, etc. (arrays are okay)
		var individualIdentifiers = noPrefixIdentifier.split(".");
		if (parent != null && parent != undefined && parent.type == 'CallExpression' && parent.callee == node) {
			individualIdentifiers.pop();
		}
		var finalString = "";
		for (var i = 0; i < individualIdentifiers.length; i++) {
			if (individualIdentifiers[i].indexOf("(") > 0) {
				if (finalString != "") {
					return finalString;
				}
				else {
					return null;
				}
			}
			else if (individualIdentifiers[i].indexOf("[") > 0) {
				var arrayIdentifier = individualIdentifiers[i].substring(0, individualIdentifiers[i].indexOf("["));
				if (isIdentifier(arrayIdentifier)) {
					//If an array is encountered, grab only the identifier part of the array, not the entire array string
					if (finalString != "") {
						finalString += "." + arrayIdentifier;
					}
					else {
						finalString += arrayIdentifier;
					}
					return finalString;
				}
			}
			else {
				if (finalString == "") {
					finalString += individualIdentifiers[i];
				}
				else {
					finalString += "." + individualIdentifiers[i];
				}
			}
		}
		return finalString;
	}
}

/**
 * Analyzes a node to see if it and its children use any identifiers
 * 
 * @param node
 * 			The node to analyze
 * @param editorInstance
 * 			The editor instance
 * @param newView
 * 			The view that uses the extracted model variables
 * @param aliases
 * 			The list of aliases
 * @param theDom
 * 			The complete DOM
 */
function visitNode_Angular(node, editorInstance, newView, aliases, theDom) {
	if (node.nodeType == 9) { //DOCUMENT node
		for (var i = 0; i < node.childNodes.length; i++) {
			visitNode_Angular(node.childNodes[i], editorInstance, newView, aliases, theDom);
		}
	}
	else if (node.nodeType == 3) { //TEXT node
		parseText_Angular(node.data, editorInstance, newView, aliases, theDom);
	}
	else if (node.nodeType == 1) { //ELEMENT node
		var newAliases = parseElement_Angular(node, editorInstance, newView, aliases, theDom);
		for (var i = 0; i < node.childNodes.length; i++) {
			visitNode_Angular(node.childNodes[i], editorInstance, newView, newAliases, theDom);
		}
	}
}

/**
 * Parses an element to see if it uses any identifiers
 * 
 * @param node
 * 			The node to analyze
 * @param editorInstance
 * 			The editor instance
 * @param newView
 * 			The view that uses the extracted model variables
 * @param aliases
 * 			The list of aliases
 * @param theDom
 * 			The complete DOM
 * @returns An updated list of aliases (must be a copy - do not modify aliases array)
 */
function parseElement_Angular(node, editorInstance, newView, aliases, theDom) {
	var newAliases = [];
	for (var i = 0; i < aliases.length; i++) {
		newAliases.push(aliases[i]);
	}
	
	//Find model variables in elements that take them as attribute values
	//TODO: Are there any other ways to use model variables
	extractMVFromAttributeValue(node, "ng-bind", editorInstance, newView, aliases, theDom);
	extractMVFromAttributeValue(node, "ng-bind-html", editorInstance, newView, aliases, theDom, IdType.STRING);
	extractMVFromAttributeValue(node, "ng-checked", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-disabled", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-hide", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-if", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-open", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-readonly", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-selected", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-show", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-value", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractMVFromAttributeValue(node, "ng-minlength", editorInstance, newView, aliases, theDom, IdType.NUMBER);
	extractMVFromAttributeValue(node, "ng-maxlength", editorInstance, newView, aliases, theDom, IdType.NUMBER);
	extractMVFromAttributeValue(node, "ng-pattern", editorInstance, newView, aliases, theDom, IdType.STRING);
	extractMVFromAttributeValue(node, "ng-trim", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	
	if (node.tagName.toLowerCase() == "ng-pluralize") {
		extractMVFromAttributeValue(node, "count", editorInstance, newView, aliases, theDom, IdType.NUMBER);
		extractMVFromAttributeValue(node, "when", editorInstance, newView, aliases, theDom);
		extractMVFromAttributeValue(node, "offset", editorInstance, newView, aliases, theDom, IdType.NUMBER);
	}
	
	if (node.tagName.toLowerCase() == "input" && node.hasAttribute("type") && node.getAttribute("type").toLowerCase() == "radio") {
		extractMVFromAttributeValue(node, "ng-model", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	}
	
	extractMVFromAttributeValue(node, "ng-bind-template", editorInstance, newView, aliases, theDom);
	extractMVFromAttributeValue(node, "ng-href", editorInstance, newView, aliases, theDom);
	extractMVFromAttributeValue(node, "ng-include", editorInstance, newView, aliases, theDom);
	extractMVFromAttributeValue(node, "ng-src", editorInstance, newView, aliases, theDom);
	extractMVFromAttributeValue(node, "ng-srcset", editorInstance, newView, aliases, theDom);
	
	//Find controller functions in elements that take them as attribute values
	//TODO: Are there any other ways to use controller functions
	extractCFFromAttributeValue(node, "ng-blur", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-change", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-click", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-copy", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-cut", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-dlbclick", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-focus", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-keydown", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-keypress", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-keyup", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-mousedown", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-mouseenter", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-mouseleave", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-mousemove", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-mouseover", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-mouseup", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-paste", editorInstance, newView, aliases, theDom);
	extractCFFromAttributeValue(node, "ng-submit", editorInstance, newView, aliases, theDom);
	
	extractCFFromAttributeValue(node, "ng-checked", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-disabled", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-hide", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-if", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-open", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-readonly", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-selected", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-show", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-value", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	extractCFFromAttributeValue(node, "ng-trim", editorInstance, newView, aliases, theDom, IdType.BOOLEAN);
	
	if (node.hasAttribute("ng-repeat")) {
		newAliases = extractMVFromNgRepeat(node, editorInstance, newView, aliases, theDom);
	}
	
	return newAliases;
}

/**
 * Parses a text node to see if it uses any identifiers
 * 
 * @param text
 * 			The text node to analyze
 * @param editorInstance
 * 			The editor instance
 * @param newView
 * 			The view that uses the extracted model variables
 * @param aliases
 * 			The list of aliases
 * @param theDom
 * 			The complete DOM
 */
function parseText_Angular(text, editorInstance, newView, aliases, theDom) {
	//Assume simple case for these for now (i.e., no expression, arrays). Or,
	//parse with esprima
	//TODO: Handle these more complicated expressions/arrays
	
	//TODO: Is there a better way to find line numbers in text nodes?
	
	var moreCurlyBraces = true;
	while (moreCurlyBraces) {
		var openBracesIndex = text.indexOf("{{");
		if (openBracesIndex >= 0) {
			var closeBracesIndex = text.substring(openBracesIndex+2).indexOf("}}"); //2 = length of "{{"
			if (closeBracesIndex >= 0) {
				var nextToParse = text.substring(openBracesIndex+2).substring(0, closeBracesIndex).trim();
				if (isIdentifier(nextToParse)) {
					var lineNumber = getLineNumberOfText(nextToParse, editorInstance);
					if (lineNumber != -1) {
						newView.addModelVariable(nextToParse, lineNumber, editorInstance, IdType.NA);
						newView.setAliases(nextToParse, aliases);
						
						//TODO: Account for the possibility that there may be multiple instances of the same identifier
						//in curly braces. You can do this by determining how many of the same identifier the view
						//already has, then passing that number to getLineNumberOfText (so the line number of the Nth
						//instance of the identifier will be output by that method)
					}
				}
				text = text.substring(closeBracesIndex+2); //2 = length of "}}"
			}
			else {
				moreCurlyBraces = false;
			}
		}
		else {
			moreCurlyBraces = false;
		}
	}
}

/**
 * Extracts model variables from the given attribute for an element
 * in the DOM. This is a generic method that should only
 * be called if no special parsing needs to be done for the elements
 * (e.g., attribute values of ng-repeat)
 * @param elem
 * 			The element
 * @param attribute
 * 			The attribute name
 * @param editorInstance
 * 			The editor instance
 * @param newView
 * 			The view that uses the extracted model variables
 * @param aliases
 * 			The list of aliases
 * @param theDom
 * 			The complete DOM
 * @param idType
 * 			The expected type
 */
function extractMVFromAttributeValue(elem, attribute, editorInstance, newView, aliases, theDom, idType) {
	if (idType == undefined) {
		idType = IdType.NA;
	}
	if (!elem.hasAttribute(attribute)) {
		return;
	}
	
	var str = elem.getAttribute(attribute).trim();
	if (attribute == "ng-bind-template" || attribute == "ng-href" || 
			attribute == "ng-include" || attribute == "ng-src" || attribute == "ng-srcset") {
		parseText_Angular(str, editorInstance, newView, aliases, theDom);
		return;
	}
	if (str.indexOf(" ") < 0) {
		var newModelVariable = str;
		
		if (idType == IdType.BOOLEAN) { //for ng-disabled, ng-show, ng-hide, etc.
			if (newModelVariable.indexOf("!") == 0) {
				newModelVariable = newModelVariable.substring(1).trim(); //Remove the "!" if it's there
			}
		}
		
		if (isIdentifier(newModelVariable)) {	
			//Find the line number 
			var lineNumber = getLineNumber(elem, theDom, editorInstance);
			newView.addModelVariable(newModelVariable, lineNumber, editorInstance, idType);
			newView.setAliases(newModelVariable, aliases);
		}
	}
	//TODO: Handle the case where the attribute value is an expression/array
}

/**
 * Extracts controller functions from the given attribute for an element
 * in the DOM. This is a generic method that should only
 * be called if no special parsing needs to be done for the elements
 * (e.g., attribute values of ng-repeat)
 * @param elem
 * 			The element
 * @param attribute
 * 			The attribute name
 * @param editorInstance
 * 			The editor instance
 * @param newView
 * 			The view that uses the extracted model variables
 * @param aliases
 * 			The list of aliases
 * @param theDom
 * 			The complete DOM
 * @param idType
 * 			The expected type
 */
function extractCFFromAttributeValue(elem, attribute, editorInstance, newView, aliases, theDom, idType) {
	if (idType == undefined) {
		idType = IdType.NA;
	}
	if (!elem.hasAttribute(attribute)) {
		return;
	}
	
	var str = elem.getAttribute(attribute).trim();
	
	//First, trim out the any leading/trailing spaces and trailing semi-colon
	while (str.slice(-1) == " " || str.slice(-1) == ";") {
		if (str.slice(-1) == " ") {
			str = str.trim();
		}
		else {
			str = str.substring(0, str.length-1);
		}
	}
	if (str.indexOf(" ") < 0) {
		if (idType == IdType.BOOLEAN) {
			if (str.indexOf("!") == 0) {
				str = str.substring(1).trim();
			}
		}
		
		if (str.indexOf("(") < 0 && idType == IdType.BOOLEAN) { //This is most likely a model variable being used to get the boolean value, so just return
			return;
		}
		
		if (str.charAt(str.length-1) == ")" && str.charAt(str.length-2) == "(") {
			str = str.substring(0, str.length-2);
		}
		else if (str.charAt(str.length-1) == ")" && str.indexOf("(") > 0) { //recall that indexOf looks for the first instance
			//Where's the first '('? This part handles the case where the CF has arguments
			str = str.substring(0, str.indexOf("("));
		}
		
		//TODO: Handle case where the "controller function" is in a nested object (we ignore it for now, by looking for ".")
		if (str.indexOf(".") < 0) {
			var newControllerFunction = str;
			
			//Find the line number 
			var lineNumber = getLineNumber(elem, theDom, editorInstance);
			newView.addControllerFunction(newControllerFunction, lineNumber, editorInstance, idType);
		}
	}
	//TODO: Handle the case where the attribute value is an expression
}

/**
 * Extracts model variables from the given attribute for an element
 * in the DOM. This is a generic method that should only
 * be called if no special parsing needs to be done for the elements
 * (e.g., attribute values of ng-repeat)
 * @param repeatElem
 * 			The element with ng-repeat
 * @param editorInstance
 * 			The editor instance
 * @param newView
 * 			The view that uses the extracted model variables
 * @param aliases
 * 			The list of aliases
 * @param theDom
 * 			The complete DOM
 * @param idType
 * 			The expected type
 */
function extractMVFromNgRepeat(repeatElem, editorInstance, newView, aliases, theDom, idType) {
	var repeatStr = repeatElem.getAttribute("ng-repeat");
	var startIndex = repeatStr.trim().lastIndexOf(" in ") + 4; //The string " in " contains four characters
	var newModelVariable = repeatStr.trim().substring(startIndex);
	
	//Find the line number
	var lineNumber = getLineNumber(repeatElem, theDom, editorInstance);
	
	if (isIdentifier(newModelVariable)) {
		newView.addModelVariable(newModelVariable, lineNumber, editorInstance, IdType.NA);
		newView.setAliases(newModelVariable, aliases);
	}
	
	//Update aliases. Go through each model variable tree
	var newAliases = []; //This is to make sure we're passing a *copy* of the updated aliases in the recursive call
	for (var i = 0; i < aliases.length; i++) {
		newAliases.push(aliases[i]);
	}
	var aliasIdentifier = repeatStr.trim().substring(0, startIndex-4); //The string " in " contains four characters
	newAliases.push(new Alias(aliasIdentifier, newView.getModelVariable(newModelVariable)));
	
	return newAliases;
}