/**
 * Finds MVC groupings for Angular application
 */
function findMVCGroupings_Angular() {
	//Find groupings based on routing information
	for (var i = 0; i < routers.length; i++) {
		var nextRoute = routers[i];
		
		var mcIdentifier = nextRoute.controller;
		var viewIdentifier = nextRoute.templateUrl;
		
		//Find the model, view, and controller that correspond to the identifiers
		var modelIndex = findModelWithIdentifier(mcIdentifier);
		var viewIndex = findViewWithIdentifier(viewIdentifier); //TODO: Find a better way to handle file paths used as view name
		var controllerIndex = findControllerWithIdentifier(mcIdentifier);
		
		if (modelIndex >= 0 && viewIndex >= 0 && controllerIndex >= 0) {
			//Log this grouping
			if (!groupingExists(modelIndex, viewIndex, controllerIndex)) {
				mvc_groups.push(new MVCGroup(modelIndex, viewIndex, controllerIndex));
			}
		}
	}
	
	//Find groupings based on statically attached controller/model in view
	for (var i = 0; i < views.length; i++) {
		var nextView = views[i];
		if (nextView.mc == null) {
			continue;
		}
		
		var mcIdentifier = nextView.mc;
		
		//Find the model and controller that uses the identifier "mcIdentifier"
		var modelIndex = findModelWithIdentifier(mcIdentifier);
		var controllerIndex = findControllerWithIdentifier(mcIdentifier);
		
		console.log(modelIndex + " " + mcIdentifier);
		console.log(controllerIndex + " " + mcIdentifier);
		
		if (modelIndex >= 0 && controllerIndex >= 0) {
			//Log this grouping
			if (!groupingExists(modelIndex, i, controllerIndex)) {
				mvc_groups.push(new MVCGroup(modelIndex, i, controllerIndex));
			}
		}
	}
}
