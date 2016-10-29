/**
 * Created by Misu Be Imp on 10/29/2016.
 */

var routers = [];
function route(controller, templateUrl, controllerAs) {
    this.controller = controller;
    this.templateUrl = templateUrl;
    this.controllerAs = controllerAs;

}
function getRouter() {
    var jsRawCode = document.getElementById('textEditor').value;
    var ast = esprima.parse(jsRawCode, {loc: true, tokens: true});
    ParseRouteConfigFile(ast);
}
function ParseRouteConfigFile(ast) {
    estraverse.traverse(ast, {
        enter: function (node) {
            if (node.type === 'CallExpression') {
                var callee = node.callee;
                if (callee == undefined || callee.property == undefined ||
                    callee.property.type == undefined || callee.property.type != 'Identifier' ||
                    callee.property.name == undefined || callee.property.name != 'when') {
                    return;
                }

                var arguments = node.arguments;
                if (arguments != undefined && arguments[1] != undefined && arguments[1].type != undefined &&
                    arguments[1].type == 'ObjectExpression' && arguments[1].properties != undefined) {

                    var foundControllerProp = false;
                    var foundTemplateUrlProp = false;
                    var foundControllerAsProp = false;
                    var controllerProperty = '';
                    var templateUrlProperty = '';
                    var controllerAsProperty = '';
                    for (i in arguments[1].properties) {
                        var property = arguments[1].properties[i];
                        if (property.key.type == 'Identifier' && property.key.name == 'controller'
                            && property.value.type == 'Literal' && property.value.value != undefined
                            && typeof property.value.value == 'string') {
                            controllerProperty = property.value.value;
                            foundControllerProp = true;
                        }
                        else if (property.key.type == 'Identifier' && property.key.name == 'templateUrl'
                            && property.value.type == 'Literal' && property.value.value != undefined
                            && typeof property.value.value == 'string') {
                            templateUrlProperty = property.value.value;
                            foundTemplateUrlProp = true;
                        }
                        else if (property.key.type == 'Identifier' && property.key.name == 'controllerAs'
                            && property.value.type == 'Literal' && property.value.value != undefined
                            && typeof property.value.value == 'string') {
                            controllerAsProperty = property.value.value;
                            foundTemplateUrlProp = true;
                        }
                    }

                    if ((foundControllerProp && foundTemplateUrlProp) || foundControllerAsProp) {
                        routers.push(new route(controllerProperty, templateUrlProperty, controllerAsProperty));
                    }
                }
            }
        }
    });
}
