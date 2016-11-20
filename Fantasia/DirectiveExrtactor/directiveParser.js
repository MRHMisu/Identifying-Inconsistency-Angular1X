module.exports.getParsedDirective=getParsedDirective;

var esprima = require('esprima');
var estraverse = require('estraverse');
var directive = {};

function getParsedDirective(code)
{
    extractDirective(code);
    return directive;
}


function extractDirective(code) {
    var jsRawCode=code
    var ast = esprima.parse(jsRawCode, {loc: true, tokens: true});
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            getDirectivePropertiesFromConstructorFunction(node);
        }
    });
}

function getDirectivePropertiesFromConstructorFunction(node) {
    if (node.type == 'VariableDeclaration') {
        var declarations = node.declarations;
        for (var i = 0; i < declarations.length; i++) {
            if (declarations[i].type == 'VariableDeclarator') {
                var variableName = declarations[i].id.name;
                if (variableName == 'directive')
                    if (declarations[i].init) {
                        if (declarations[i].init.type == 'ObjectExpression') {
                            for (var j = 0; j < declarations[i].init.properties.length; j++) {
                                var name = declarations[i].init.properties[j].key.name;
                                var value = declarations[i].init.properties[j].value.value;
                                directive["'" + name + "'"] = value;
                            }
                        }
                    }
            }
        }
    }
}
