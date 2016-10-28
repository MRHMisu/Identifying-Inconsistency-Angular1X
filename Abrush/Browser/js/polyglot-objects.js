/**
 * List of models. Each model is defined by its model name and the list of
 * model variables defined in the model. The model name is equal to the
 * first parameter of the encapsulating ".controller" call. For each model 
 * variable, the line and editor instance where the variable is defined are
 * included
 */
var models = [];

/**
 * List of views. Each view is defined by its view name (i.e., name of the 
 * file containing the view), the model variables used in the view, the controller
 * functions used in the view, and a string indicating what model/controller the
 * view is tied to (only if it is statically tied to a model/controller via ng-controller.
 * If not, this value is null). For each model variable and controller function,
 * the line and editor instance where the variable/function is used are
 * included
 */
var views = [];

/**
 * List of controllers. Each controller is defined by its controller name, the
 * model variables used in the controller, and the controller functions defined
 * in the controller. The controller name is equal to the first parameter of the
 * encapsulating ".controller" call. For each model variable and controller
 * function, the line and editor instance where the variable/function is
 * used/defined are included.
 */
var controllers = [];

/**
 * List of (M, V, C) groupings that can appear during web app execution. The M,
 * V, and C are referenced by their index numbers in the models, views, and
 * controllers arrays (respectively)
 */
var mvc_groups = [];

/**
 * List of JS code snippets representing the routers (if any)
 */
var routers = [];

/**
 * List of all framework types
 */
var FrameworkType = {
	ANGULAR: 1,
	BACKBONE: 2,
	EMBER: 3
};
