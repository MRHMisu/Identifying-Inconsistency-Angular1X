/**
 * Created by Misu Be Imp on 6/10/2016.
 */
var textInEditor;
function getJavaScriptCode() {

    //parse javascript code
    textInEditor = document.getElementById('textEditor').value;
    //var parsedJavaScript=esprima.parse(textInEditor);

    //var ast = esprima.parse(textInEditor, {loc: true, range: true, comment: true, tokens: true});
    var ast = esprima.parse(textInEditor, {loc: true});
    var variablesList = new Array();
    var viewModelAssignmentVariable = new Array();
    estraverse.traverse(ast, {
        enter: function (node, parent) {

            isViewModelThisExpression(node);

            if (isViewModelAssignmentExpression(node)) {
                viewModelAssignmentVariable.push(isViewModelAssignmentExpression(node));
            }
            isFunctionExpressionAndDeclaration(node);
            if (isVariableDeclaration(node)) {
                variablesList.push(isVariableDeclaration(node));
            }
            isCalleeExpression(node);
            isAssignmentExpression(node);
        }
    });
}


/*
 * add();
 * vm.add();
 * add(a,b);
 * vm.add(a,b);
 * (function(){})();
 * */

var calleeExpression = new Array();
function isCalleeExpression(node) {

    if (node.type == 'CallExpression') {
        var arguments = new Array();
        for (var i = 0; i < node.arguments.length; i++) {
            var type = node.arguments[i].type;
            if (type == 'Identifier') {
                arguments.push({'name': "agr" + i, 'identifier': node.arguments[i].name});
            }
            if (type == 'Literal') {

                arguments.push({
                    'name': "agr" + i,
                    'value': node.arguments[i].value,
                    'type': typeof node.arguments[i].value
                });
            }
            if (type == 'ObjectExpression') {

                var objectProperties = new Array();
                for (var j = 0; j < node.arguments[i].properties.length; j++) {
                    var name = node.arguments[i].properties[j].key.value;
                    var value = node.arguments[i].properties[j].value.value;
                    var type = typeof value;
                    objectProperties.push(new property(name, value, type));
                }
                arguments.push(objectProperties);
            }

        }
        if (node.callee.type == 'Identifier') {

        }
        if (node.callee.object && node.callee.type == 'MemberExpression') {
            var objectName = node.callee.object;
            var propertyName = node.callee.property.name;
            var arguments = node.arguments;
            calleeExpression.push({'name': objectName, 'propertyName': propertyName, 'arguments': arguments});
        } else if (node.callee.type == 'FunctionExpression') {
            isFunctionExpressionAndDeclaration(node.callee);
        } else {
            var name = node.callee.name;
            var arg = node.arguments;
            calleeExpression.push({'name': name, 'arguments': arg});
        }


    }


}


/*
 * function (m)
 * {
 *   return m
 * }
 *
 * */
var functionsInController = new Array();
function isFunctionExpressionAndDeclaration(node) {
    if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {

        var functionName = node.id ? node.id.name : "<anonymous functions>";
        var parameters = new Array();
        for (var i = 0; i < node.params.length; i++) {
            parameters.push(node.params[i].name);
        }
        var returnType = 'void';
        var length = node.body.body.length;
        if (length > 0) {
            if (node.body.body[length - 1].type == "ReturnStatement") {
                returnType = node.body.body[length - 1].argument;
            }
        }
        functionsInController.push(new ControllerFunction(functionName, parameters, returnType));
    }

}


//var vm=this;
var thisExpression = new Array();
function isViewModelThisExpression(node) {
    if (node.type == 'VariableDeclarator') {
        if (node.init && node.init.type == "ThisExpression" && node.id.type == 'Identifier') {
            var thisViewModelExpression = node.id.name;
            thisExpression.push(thisViewModelExpression);
        }

    }
}

/*
 *Name="Misu";
 * roll=0516;
 * student=
 * {
 *   name:'misu',
 *   class:'FirstYear',
 *   roll:'5016'
 * }
 *
 * */

var assignedVariables = new Array();
function isAssignmentExpression(node) {
    if (node.type == 'AssignmentExpression' && node.operator == '=') {
        if (node.left.type == 'Identifier') {
            var arsingName = node.left.name;
            if (node.right.type == 'ObjectExpression') {
                var objectProperties = new Array();
                for (var j = 0; j < node.right.properties.length; j++) {
                    var name = node.right.properties[j].key.name;
                    var value = node.right.properties[j].value.value;
                    var type = typeof value;
                    objectProperties.push(new property(name, value, type));
                }
                assignedVariables.push(new objectVariableInController(arsingName, objectProperties, 'assignedObject'));

            }
            if (node.right.type == 'ArrayExpression') {
                var elements = node.right.elements;
                var elementProperties = new Array();
                for (var k = 0; k < elements.length; k++) {
                    var value = elements[k].value;
                    var type = typeof value;
                    elementProperties.push(new element(value, type));
                }
                assignedVariables.push(new arrayVariableInController(arsingName, elementProperties));
            }

            if (node.right.type == 'Literal') {
                var variableValue = node.right.value;
                var variableDataType = typeof variableValue;
                assignedVariables.push(new singleVariableInController(arsingName, variableValue, variableDataType));
            }

        }

    }


}

/*
 this.name='misu';
 vm.name='misu'//
 vm.roll=[1,2,3];
 vm.student=
 {
 'name':'misu',
 'class':'FirstYear',
 'roll':'5016'
 }
 level 2
 vm.student.name='misu'
 level 3
 vm.FirstYear.student.name='misu'
 */
function isViewModelAssignmentExpression(node) {
    if (node.type == 'AssignmentExpression') {
        if (node.operator == '=') {
            if (node.left.object && node.left.type == 'MemberExpression') {
                if (node.left.object.object && node.left.object.type == 'MemberExpression') {
                    if (node.left.object.object.object && node.left.object.object.type == 'MemberExpression') {
                        //vm.FirstYear.student.name='misu'
                        //levelThree;
                        var levelThree = 10;
                        var viewModelIdentifierLevelThree = node.left.object.object.object.name + '.' + node.left.object.object.property.name + '.' + node.left.object.property.name + '.' + node.left.property.name;
                        return getAssignmentValueFromRightSide(viewModelIdentifierLevelThree, node);
                    }
                    //vm.student.name='misu'
                    var viewModelIdentifierLevelTwo = node.left.object.object.name + '.' + node.left.object.property.name + '.' + node.left.property.name;
                    //levelTwo;
                    var levelTwo = 9;
                    return getAssignmentValueFromRightSide(viewModelIdentifierLevelTwo, node);
                }
                //vm.name='misu'
                //levelOne ;
                var objectName = node.left.object.name;
                var objectProperty = node.left.property.name;
                var viewModelIdentifierLevelOne = objectName + '.' + objectProperty;

                return getAssignmentValueFromRightSide(viewModelIdentifierLevelOne, node);

            }
        }
    }
}

function getAssignmentValueFromRightSide(viewModelIdentifier, node) {
    if (node.right.type == 'ObjectExpression') {
        var objectProperties = new Array();
        for (var j = 0; j < node.right.properties.length; j++) {
            var name = node.right.properties[j].key.value;
            var value = node.right.properties[j].value.value;
            var type = typeof value;
            objectProperties.push(new property(name, value, type));
        }
        return new objectVariableInController(viewModelIdentifier, objectProperties, 'viewModelObject');
    }
    if (node.right.type == 'ArrayExpression') {
        var elements = node.right.elements;
        var elementProperties = new Array();
        for (var k = 0; k < elements.length; k++) {
            var value = elements[k].value;
            var type = typeof value;
            elementProperties.push(new element(value, type));
        }
        return new arrayVariableInController(viewModelIdentifier, elementProperties);
    }
    if (node.right.type == 'Literal') {
        var variableValue = node.right.value;
        var variableDataType = typeof variableValue;
        return new singleVariableInController(viewModelIdentifier, variableValue, variableDataType);
    }
    if (node.right.type == 'CallExpression') {
        //new have to implement;
        var variableValue = node.right.value;
        var variableDataType = typeof variableValue;
        //viewModelAssignmentVariable.push(new singleVariableInController(viewModelIdentifier, variableValue, variableDataType));
        return new singleVariableInController(viewModelIdentifier, variableValue, variableDataType);
    }

}

/*all initialize and uninitialized variable
 * var m;(null initialization)
 * or var m,j,k;(multiple null initialization)
 *
 * var m=0; or var m=0,j="misu";(primary initialization)
 *
 * var m=[1,2,3,4]; (Array initialization)
 *
 * (object initialization)
 * var student=
 * {
 *   name:'misu',
 *   class:'FirstYear',
 *   roll:'0516'
 * }
 * */

function isVariableDeclaration(node) {
    if (node.type == 'VariableDeclaration') {
        var declarations = node.declarations;
        for (var i = 0; i < declarations.length; i++) {
            if (declarations[i].type == 'VariableDeclarator') {
                var variableName = declarations[i].id.name;
                if (declarations[i].init) {
                    if (declarations[i].init.type == 'ObjectExpression') {
                        var objectProperties = new Array();
                        for (var j = 0; j < declarations[i].init.properties.length; j++) {
                            var name = declarations[i].init.properties[j].key.value;
                            var value = declarations[i].init.properties[j].value.value;
                            var type = typeof value;
                            objectProperties.push(new property(name, value, type));
                        }
                        return new objectVariableInController(variableName, objectProperties, 'objectType');
                    }
                    if (declarations[i].init.type == 'ArrayExpression') {

                        var elements = declarations[i].init.elements;
                        var elementProperties = new Array();
                        for (var k = 0; k < elements.length; k++) {
                            var value = elements[k].value;
                            var type = typeof value;
                            elementProperties.push(new element(value, type));
                        }
                        return new arrayVariableInController(variableName, elementProperties);
                    }
                    if (declarations[i].init.type == 'Literal') {
                        var variableValue = declarations[i].init ? declarations[i].init.value : 'uninitialized';
                        var variableDataType = declarations[i].init ? typeof declarations[i].init.value : 'none';
                        return new singleVariableInController(variableName, variableValue, variableDataType);
                    }
                }
                else {
                    var variableValue = 'uninitialized';
                    var variableDataType = 'null';
                    return new singleVariableInController(variableName, variableValue, variableDataType);
                }
            }
        }
    }
}




