module.exports.getParsedRoute = getParsedRoute;

var esprima = require('esprima');
var estraverse = require('estraverse');
var Route_Entity = require('./Controller_Entity.js');


var routers = [];

function getParsedRoute(routeCode) {
    var routeCode = routeCode;
    var ast = esprima.parse(routeCode, {loc: true, tokens: true});
    ParseRouteConfigFile(ast);

    return routers;
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

                    var isFoundControllerProperty = false;
                    var isFoundTemplateUrlProperty = false;
                    var isFoundControllerAsProperty = false;
                    var controllerProperty = '';
                    var templateUrlProperty = '';
                    var controllerAsProperty = '';
                    for (i in arguments[1].properties) {
                        var property = arguments[1].properties[i];
                        if (property.key.type == 'Identifier' && property.key.name == 'controller'
                            && property.value.type == 'Literal' && property.value.value != undefined
                            && typeof property.value.value == 'string') {
                            controllerProperty = property.value.value;
                            isFoundControllerProperty = true;
                        }
                        else if (property.key.type == 'Identifier' && property.key.name == 'templateUrl'
                            && property.value.type == 'Literal' && property.value.value != undefined
                            && typeof property.value.value == 'string') {
                            templateUrlProperty = property.value.value;
                            isFoundTemplateUrlProperty = true;
                        }
                        else if (property.key.type == 'Identifier' && property.key.name == 'controllerAs'
                            && property.value.type == 'Literal' && property.value.value != undefined
                            && typeof property.value.value == 'string') {
                            controllerAsProperty = property.value.value;
                            isFoundTemplateUrlProperty = true;
                        }
                    }

                    if ((isFoundControllerProperty && isFoundTemplateUrlProperty) || isFoundControllerAsProperty) {
                        routers.push(new Route_Entity.route(controllerProperty, templateUrlProperty, controllerAsProperty));
                    }
                }
            }
        }
    });
}
