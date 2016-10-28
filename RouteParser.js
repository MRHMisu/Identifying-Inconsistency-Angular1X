/**
 * Created by Misu Be Imp on 10/29/2016.
 */
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
