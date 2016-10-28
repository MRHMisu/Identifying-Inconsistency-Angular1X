/**
 * GROUPER
 * 
 * This module finds (model, view, controller) groupings that can happen throughout web
 * app execution
 */

/**
 * Finds the (model, view, controller) groupings in the web app based on
 * 
 * (1) The routing information, which is retrieved by parsing the JS code
 * (2) The views in which a controller/model is attached statically, which is retrieved
 * 		by looking through each retrieved view (stored in the views array)
 * @param framework The type of framework
 */
function findMVCGroupings(framework) {
	if (framework == FrameworkType.ANGULAR) {
		findMVCGroupings_Angular();
	}
	else if (framework == FrameworkType.BACKBONE) {
		findMVCGroupings_Backbone();
	}
	else if (framework = FrameworkType.EMBER) {
		findMVCGroupings_Ember();
	}
	else { //Default
		findMVCGroupings_Angular();
	}
}

/**
 * Helper function for finding the index number of the model with the given identifier
 * @param {Object} identifier
 * 					The identifier for the model being found
 * @returns The index of the model with the given identifier, if found; if not found, returns -1
 */
function findModelWithIdentifier(identifier) {
	for (var i = 0; i < models.length; i++) {
		var nextModel = models[i];
		if (nextModel.name == identifier) {
			return i;
		}
	}
	return -1;
}

/**
 * Helper function for finding the index number of the controller with the given identifier
 * @param {Object} identifier
 * 					The identifier for the controller being found
 * @returns The index of the controller with the given identifier, if found; if not found, returns -1
 */
function findControllerWithIdentifier(identifier) {
	for (var i = 0; i < controllers.length; i++) {
		var nextController = controllers[i];
		if (nextController.name == identifier) {
			return i;
		}
	}
	return -1;
}

/**
 * Helper function for finding the index number of the view with the given identifier
 * @param {Object} identifier
 * 					The identifier for the view being found
 * @returns The index of the view with the given identifier, if found; if not found, returns -1
 */
function findViewWithIdentifier(identifier) {
	for (var i = 0; i < views.length; i++) {
		var nextView = views[i];
		if (nextView.name == identifier) {
			return i;
		}
	}
	return -1;
}

/**
 * Determine if the MVC grouping has already been recorded
 * @param {Object} modelIndex
 * @param {Object} viewIndex
 * @param {Object} controllerIndex
 * @returns true if (modelIdx, viewIdx, controllerIdx) already exists in mvc_groups
 */
function groupingExists(modelIndex, viewIndex, controllerIndex) {
	for (var i = 0; i < mvc_groups.length; i++) {
		var nextMVCGroup = mvc_groups[i];
		if (nextMVCGroup.modelIdx == modelIndex && nextMVCGroup.viewIdx == viewIndex && nextMVCGroup.controllerIdx == controllerIndex) {
			return true;
		}
	}
	
	return false;
}
