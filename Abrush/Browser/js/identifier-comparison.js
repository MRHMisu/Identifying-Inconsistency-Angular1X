/**
 * IDENTIFIER COMPARISON
 * 
 * This module compares the identifiers (model variables and controller functions)
 * in each grouping and finds inconsistencies between the definition and use of
 * these identifiers
 */

/**
 * Finds identifier inconsistencies within a particular
 * (model, view, controller) grouping. For each inconsistency
 * found, a warning is placed in the relevant line of code in
 * the relevant editor.
 * 
 * Note that a model variable identifier is inconsistent if
 * the identifier is used in the controller or view, but not
 * defined in the model. A controller function identifier is
 * inconsistent if the identifier is used in the view, but not
 * defined in the controller.
 * 
 * @param {Object} grouping
 * 			An array containing the indexes of the pertinent
 * 			model, view, or controller object in the models,
 * 			views, and controllers arrays (respectively)
 */
function findIdentifierInconsistencies(grouping) {
	var model = models[grouping.modelIdx];
	var view = views[grouping.viewIdx];
	var controller = controllers[grouping.controllerIdx];
	
	var mvInModel = model.modelVariables;
	var mvInView = view.modelVariables;
	var mvInController = controller.modelVariables;
	var cfInView = view.controllerFunctions;
	var cfInController = controller.controllerFunctions;
	
	//Find inconsistencies between model and view (i.e., Are there any model variables not
	//defined in the model but used in the view?)
	for (var i = 0; i < mvInView.length; i++) {
		var mvIdentifier = mvInView[i].identifier;
		var idFound = false;
		var typesMatch = true;
		var matchingMV = null;
		var ignore = false;
		for (var j = 0; j < mvInModel.length; j++) {
			var comparison = modelVariablesComparison(getDealiasedSequence(mvInView[i], grouping), mvInModel[j]);
			console.log(comparison.match);
			console.log(comparison.ignore);
			if (comparison.match && comparison.ignore) {
				console.log("id found");
				idFound = true;
				ignore = true;
				break;
			}
			if (comparison.match) {
				idFound = true;
				matchingMV = comparison.matchingMV;
				if (mvInView[i].type != IdType.NA && matchingMV.type != IdType.UNKNOWN &&
						matchingMV.type != mvInView[i].type) {
					typesMatch = false;
				}
				break;
			}
		}
		if (!idFound) {
			console.log("id not found");
			//Undefined model variable used in view! Show error
			var lineNumber = mvInView[i].lineNumber;
			var editor = editors[mvInView[i].editorInstance].instance;
			
		  	var updatedAnnotations = editor.getSession().getAnnotations();
		  	updatedAnnotations.push({
				row: lineNumber-1,
				text: "Undefined model variable " + mvIdentifier,
				type: "error" // also warning and information	
		  	});
		  	editor.getSession().setAnnotations(updatedAnnotations);
		}
		else if (!typesMatch && !ignore) {
			//Type mismatch! Show error
			var lineNumber = matchingMV.lineNumber;
			var editor = editors[matchingMV.editorInstance].instance;
			
			var updatedAnnotations = editor.getSession().getAnnotations();
		  	updatedAnnotations.push({
				row: lineNumber-1,
				text: "Model variable " + matchingMV.identifier + " is of type " + matchingMV.type + ". Expected to be " + mvInView[i].type,
				type: "error" // also warning and information	
		  	});
		  	editor.getSession().setAnnotations(updatedAnnotations);
		}
	}
	
	//Find inconsistencies between model and controller
	for (var i = 0; i < mvInController.length; i++) {
		var mvIdentifier = mvInController[i].identifier;
		var idFound = false;
		for (var j = 0; j < mvInModel.length; j++) {
			if (modelVariablesComparison(mvInController[i].getSequence(), mvInModel[j]).match) {
				idFound = true;
				break;
			}
		}
		if (!idFound) {
			//First, check if the identifier is actually a controller function identifier (which is possible in Angular)
			//If so, just ignore it
			var idIsControllerFunction = false;
			for (var k = 0; k < cfInController.length; k++) {
				if (mvIdentifier == cfInController[k].identifier) {
					idIsControllerFunction = true;
					break;
				}
			}
			
			if (!idIsControllerFunction) {
				//Undefined model variable used in controller! Show warning
				var lineNumber = mvInController[i].lineNumber;
				var editor = editors[mvInController[i].editorInstance].instance;
				
			  	var updatedAnnotations = editor.getSession().getAnnotations();
			  	updatedAnnotations.push({
					row: lineNumber-1,
					text: "Undefined model variable " + mvIdentifier,
					type: "error" // also warning and information
			 	 });
			  	editor.getSession().setAnnotations(updatedAnnotations);
			}
		}
	}
	
	//Find inconsistencies between controller and view
	for (var i = 0; i < cfInView.length; i++) {
		var cfIdentifier = cfInView[i].identifier;
		var idFound = false;
		var matchingCF = null;
		for (var j = 0; j < cfInController.length; j++) {
			if (cfInController[j].identifier == cfIdentifier) {
				idFound = true;
				matchingCF = cfInController[j];
				break;
			}
		}
		if (!idFound) {
			//Undefined controller function used in view! Show warning
			var lineNumber = cfInView[i].lineNumber;
			var editor = editors[cfInView[i].editorInstance].instance;
			
			var updatedAnnotations = editor.getSession().getAnnotations();
			updatedAnnotations.push({
				row: lineNumber-1,
				text: "Undefined controller function " + cfIdentifier,
				type: "error" // also warning and information
			});
			editor.getSession().setAnnotations(updatedAnnotations);
		}
		else {
			//Check for type mismatch
			if (cfInView[i].type != IdType.NA && matchingCF.type != IdType.UNKNOWN &&
					matchingCF.type != IdType.NA && matchingCF.type != cfInView[i].type) {
				var lineNumber = matchingCF.lineNumber;
				var editor = editors[matchingCF.editorInstance].instance;
				
				var updatedAnnotations = editor.getSession().getAnnotations();
				updatedAnnotations.push({
					row: lineNumber-1,
					text: "Controller function " + matchingCF.identifier + " returns type " + matchingCF.type + ". Expected to be " + cfInView[i].type,
					type: "error" // also warning and information
				});
				editor.getSession().setAnnotations(updatedAnnotations);
			}
		}
	}
	
	//TODO: Find *unused* model variables (i.e., not used in either controller or view)
}

/**
 * Determine if the model variable nested object sequence can be found in the given model variable
 * tree. Note that the sequence may consist of just one identifier, and the tree may consist of just
 * one node. Also, note that the "*any*" identifier is a catch-all.
 * 
 * Assumes sequence is non-empty
 * @param {Object} sequence
 * 			The sequence to test
 * @param {Object} tree
 * 			The tree with which to compare the sequence
 */
function modelVariablesComparison(sequence, tree) {
	console.log(sequence);
	console.log(tree);
	if (sequence == null) {
		//Unhandled case, so ignore
		return {match: true, matchingMV: null, ignore: true};
	}
	if (sequence[0] == tree.identifier || sequence[0] == "*any*") {
		if (sequence.length == 1) {
			return {match: true, matchingMV: tree, ignore: false};
		}
		else if (tree.childModelVariables.length == 0 && sequence.length > 1 && sequence[1] == "*any*") {
			return {match: true, matchingMV: tree, ignore: true}; //Ignore, because the reason for the non-match may be that we're trying to translate an array
		}
		else if (tree.childModelVariables.length == 0 && sequence.length > 1) {
			if (tree.type != IdType.NUMBER && tree.type != IdType.STRING && tree.type != IdType.BOOLEAN) {
				//These conditions imply that subsequent identifiers in sequence refer to 
				//identifiers that may have been inferred from an external source. In this case,
				//we have to be conservative
				console.log("True: " + sequence);
				return {match: true, matchingMV: tree, ignore: true};
			}
			else {
				//If, however, the type is any of the above "primitive types", then it is apparent that there can be
				//no additional child identifiers
				console.log("False: " + sequence);
				return {match: false, matchingMV: null, ignore: false};
				
			}
		}
		else {
			var nextSequence = [];
			for (var i = 1; i < sequence.length; i++) {
				nextSequence.push(sequence[i]);
			}
			if (sequence.length > 1 && sequence[1] == "*any*") { //if next identifier in sequence is *any*
				for (var i = 0; i < tree.childModelVariables.length; i++) {
					var compareChild = modelVariablesComparison(nextSequence, tree.childModelVariables[i]);
					if (!compareChild.match) {
						return compareChild; //If sequence[0] is *any*, this implies that it must match the profile of every single subtree rooted at each child of tree
					}
					if (i == tree.childModelVariables.length-1) { //last element
						//If all profiles match, then we just take one of them (the last element in this case) as the representative
						return compareChild; //compareChild.match must be true here, by virtue of the fact that the preceding if statement failed
					}
				}
				
				//If this point is reached, that means there is no child. In this case, check for the type of this
				//leaf node (if it is a "primitive", then it doesn't make sense for there to be an "*any*" in the sequence,
				//so return false in that case; otherwise, be conservative and return true)
				if (tree.type != IdType.NUMBER && tree.type != IdType.STRING && tree.type != IdType.BOOLEAN) {
					return {match: true, matchingMV: tree, ignore: true};
				}
				else {
					return {match: false, matchingMV: null, ignore: false};
				}
			}
			else {
				for (var i = 0; i < tree.childModelVariables.length; i++) {
					var compareChild = modelVariablesComparison(nextSequence, tree.childModelVariables[i]);
					if (compareChild.match) {
						return compareChild;
					}
				}
				return {match: false, matchingMV: null, ignore: false};
			}
		}
	}
	else {
		return {match: false, matchingMV: null, ignore: false};
	}
}

/**
 * Find the dealiased sequence for a particular model variable that is used by
 * a view. Note that the "*any*" identifier is a catch-all
 * @param {Object} mv
 * 			Model variable used by a view
 * @param {Object} grouping
 * 			The grouping
 */
function getDealiasedSequence(mv, grouping) {
	var dealiasedSequences = [];
	var model = models[grouping.modelIdx];
	
	var nextAliasSet = mv.aliases;
	var nextIdentifier = mv.identifier;
	var moreToDealias = true;
	var dealiasedStr = "";
	var dealiasedOverall = false;
	
	do {
		var dealiased = false;
		for (var i = 0; i < nextAliasSet.length; i++) {
			var nextAlias = nextAliasSet[i];
			if (nextIdentifier.indexOf(nextAlias.original) == 0) {
				dealiased = true;
				dealiasedOverall = true;
				dealiasedStr = ".*any*" + nextIdentifier.substring(nextAlias.original.length) + dealiasedStr;
				if (nextAlias.getObjectMV() === undefined) {
					return null; //Unable to resolve alias due to case that is not currently handled
				}
				nextAliasSet = nextAlias.getObjectMV().aliases;
				nextIdentifier = nextAlias.getObjectMV().identifier;
				break;
			}
		}
		if (!dealiased) {
			moreToDealias = false;
		}
	} while (moreToDealias)
	
	if (dealiasedOverall) {
		dealiasedStr = nextIdentifier + dealiasedStr;
	}
	else {
		dealiasedStr = nextIdentifier;
	}
	
	return dealiasedStr.split(".");
}
