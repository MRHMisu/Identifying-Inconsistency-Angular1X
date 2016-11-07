module.exports.getParsedController = getParsedController;
var esprima = require('esprima');
var estraverse = require('estraverse');
var controllerEntity = require('./Controller_Entity.js');


var viewModelIdentifier = {};
var viewModel_VariableList = [];
var modelVariableList = [];
var modelVariableArrayList = [];
var functionList = [];
var controllerFunctionList = [];

function getParsedController(code) {
    getJavaScriptCode(code);
    return {
        'viewModelIdentifier': viewModelIdentifier,
        'modelVariableList': modelVariableList,
        'controllerFunctionList': controllerFunctionList,
        'modelVariableArrayList': modelVariableArrayList
    }
}

function getJavaScriptCode(code) {
    var jsRawCode = code// document.getElementById('textEditor').value;
    var ast = esprima.parse(jsRawCode, {loc: true, tokens: true});
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            isViewModelThisExpression(node);
            getViewModelVariables(node);
            getAllFunctionalExpression(node);
            //isCalleeExpression(node);

        }
    });
    getControllerFunctionListFromModelAssingmentVariable();
    getUpdatedModelVariables()
}


function getControllerFunctionListFromModelAssingmentVariable() {
    for (var i = 0; i < functionList.length; i++) {
        var regx = functionList[i].controllerFunctionName;// '/' + functionList[i].name + '/g';
        var regxObj = new RegExp(regx);
        for (var j = 0; j < viewModel_VariableList.length; j++) {
            if (regxObj.test(viewModel_VariableList[j].value)) {
                controllerFunctionList.push(functionList[i]);
            }
        }
    }
}

function getUpdatedModelVariables() {
    for (var i = 0; i < controllerFunctionList.length; i++) {
        for (var j = 0; j < viewModel_VariableList.length; j++) {
            if (!(viewModel_VariableList[j].modelVariableName.indexOf(controllerFunctionList[i].controllerFunctionName) > -1)) {
                modelVariableList.push(viewModel_VariableList[j]);
            }
        }
    }
}

//var vm=this;
function isViewModelThisExpression(node) {
    if (node.type == 'VariableDeclarator') {
        if (node.init && node.init.type == "ThisExpression" && node.id.type == 'Identifier') {
            var thisViewModelExpression = node.id.name;
            viewModelIdentifier.name = thisViewModelExpression;
            viewModelIdentifier.lineNumber = node.loc.end.line;
        }
    }
}
/*
 this.name='misu';
 vm.name='misu'//
 vm.rolls=[1,2,3];
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
function getViewModelVariables(node) {
    if (node.type == 'AssignmentExpression') {
        if (node.operator == '=') {
            if (node.left.object && node.left.type == 'MemberExpression') {
                if (node.left.object.object && node.left.object.type == 'MemberExpression') {
                    if (node.left.object.object.object && node.left.object.object.type == 'MemberExpression') {
                        //vm.FirstYear.student.name='misu'
                        //levelThree;
                        var viewModelIdentifierLevelThree = node.left.object.object.object.name + '.' + node.left.object.object.property.name + '.' + node.left.object.property.name + '.' + node.left.property.name;
                        return getAssignmentValueFromRightSide(viewModelIdentifierLevelThree, node);
                    }
                    //vm.student.name='misu'
                    var viewModelIdentifierLevelTwo = node.left.object.object.name + '.' + node.left.object.property.name + '.' + node.left.property.name;
                    //levelTwo;
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


    if (node.right.type == 'Identifier') {
        var variableValue = node.right.name;
        var lineNumber = node.right.loc.end.line;
        var variableDataType = typeof variableValue;
        return viewModel_VariableList.push(new controllerEntity.modelVariable(viewModelIdentifier, variableValue, variableDataType, lineNumber));
    }
    if (node.right.type == 'Literal') {
        var variableValue = node.right.value;
        var lineNumber = node.right.loc.end.line;
        var variableDataType = typeof variableValue;
        return viewModel_VariableList.push(new controllerEntity.modelVariable(viewModelIdentifier, variableValue, variableDataType, lineNumber));
    }
    if (node.right.type == 'ObjectExpression') {
        var objectProperties = new Array();
        for (var j = 0; j < node.right.properties.length; j++) {
            var variableName = viewModelIdentifier + '.' + node.right.properties[j].key.value;
            var variableValue = node.right.properties[j].value.value;
            var variableDataType = typeof variableValue;
            var lineNumber = node.right.properties[j].loc.end.line;
            viewModel_VariableList.push(new controllerEntity.modelVariable(variableName, variableValue, variableDataType, lineNumber));
        }
        return;
    }
    if (node.right.type == 'ArrayExpression') {

        var identifierName = viewModelIdentifier;
        var singularPart = identifierName.substring(0, identifierName.length - 1).split('.')[1];
        var elements = node.right.elements;
        var elementProperties = new Array();
        var lineNumber = node.right.loc.end.line;
        for (var k = 0; k < elements.length; k++) {
            var variableValue = elements[k].value;
            var variableDataType = typeof variableValue;
            elementProperties.push(new controllerEntity.element(variableValue, variableDataType));
        }
        return modelVariableArrayList.push(new controllerEntity.modelVariableArray(identifierName, singularPart, elementProperties, lineNumber));
    }
    if (node.right.type == 'CallExpression') {
        return;

    }
}


/*
 * function (m)
 * {
 *   return m
 * }
 *
 * */
function getAllFunctionalExpression(node) {
    if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {
        var functionName = node.id ? node.id.name : "anonymous_functions";
        var startLineNumber = node.loc.start.line;
        var endLineNumber = node.loc.end.line;

        var functionBody = node.body.body;
        var length = node.body.body.length;
        var returnExpression;
        var returnedType = 'void';
        var returnTypeIdentifier = '';
        if (length > 0) {
            if (node.body.body[length - 1].type == "ReturnStatement") {
                returnExpression = node.body.body[length - 1].argument;
                var functionInternalVariableList = [];
                for (var i = 0; i < functionBody.length; i++) {
                    var identifierObject = getInternalFunctionDeclareVariables(functionBody[i]);
                    if (identifierObject) {
                        functionInternalVariableList.push(identifierObject);
                    }

                }
                //var returnTypeIdentifier = returnExpression.name;
                var returnRegEx = returnExpression.name;// '/' + returnExpression.name + '/g';
                var returnTypeIdentifier = new RegExp(returnRegEx);
                for (var j = 0; j < functionInternalVariableList.length; j++) {
                    if (returnTypeIdentifier.test(functionInternalVariableList[j].name)) {
                        returnTypeIdentifier = functionInternalVariableList[j].name;
                        returnedType = functionInternalVariableList[j].type;
                    }

                }
                if (returnedType == null) {
                    var functionInternalAssingmentVariableList = [];
                    for (var k = 0; k < functionBody.length; k++) {
                        var identifier = getInternalFunctionAssignedVariables(functionBody[k]);
                        if (identifier) {
                            functionInternalAssingmentVariableList.push(identifier);
                        }
                    }
                    //var returnIdentifierRegEx = returnTypeIdentifier;
                    var regEx = returnTypeIdentifier;// '/' + returnTypeIdentifier + '/g';
                    var returnIdentifierRegEx = new RegExp(regEx);
                    for (var l = 0; l < functionInternalAssingmentVariableList.length; l++) {
                        if (returnIdentifierRegEx.test(functionInternalAssingmentVariableList[l].name)) {
                            returnTypeIdentifier = functionInternalAssingmentVariableList[l].name;
                            returnedType = functionInternalAssingmentVariableList[l].type;
                        }
                    }
                }
            }
        }

        functionList.push(new controllerEntity.controllerFunction(functionName, returnedType, startLineNumber, endLineNumber));
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
function getInternalFunctionDeclareVariables(node) {
    if (node.type == 'VariableDeclaration') {
        var declarations = node.declarations;
        for (var i = 0; i < declarations.length; i++) {
            if (declarations[i].type == 'VariableDeclarator') {
                var variableName = declarations[i].id.name;
                if (declarations[i].init) {
                    if (declarations[i].init.type == 'Literal') {
                        var variableValue = declarations[i].init ? declarations[i].init.value : 'uninitialized';
                        var variableDataType = declarations[i].init ? typeof declarations[i].init.value : 'none';
                        return {name: variableName, type: variableDataType};
                    }
                    if (declarations[i].init.type == 'ObjectExpression') {
                        var objectProperties = new Array();
                        for (var j = 0; j < declarations[i].init.properties.length; j++) {
                            var name = declarations[i].init.properties[j].key.name;
                            var value = declarations[i].init.properties[j].value.value;
                            var type = typeof value;
                            objectProperties.push(new controllerEntity.property(name, value, type));
                        }
                        return {name: variableName, type: "objects"};
                    }
                    if (declarations[i].init.type == 'ArrayExpression') {

                        var elements = declarations[i].init.elements;
                        var elementProperties = new Array();
                        for (var k = 0; k < elements.length; k++) {
                            var value = elements[k].value;
                            var type = typeof value;
                            elementProperties.push(new controllerEntity.element(value, type));
                        }
                        return {name: variableName, type: "array"};
                    }
                    if (declarations[i].init.type == 'CallExpression') {
                        //ToDo
                        return;
                    }
                    if (declarations[i].init.type == 'ReturnStatement') {
                        return;
                    }
                }
                else {
                    var variableValue = 'uninitialized';
                    var variableDataType = null;
                    return {name: variableName, type: variableDataType};
                }
            }
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
function getInternalFunctionAssignedVariables(node) {
    if (node.type == "ExpressionStatement") {
        if (node.expression.type == 'AssignmentExpression' && node.expression.operator == '=') {
            if (node.expression.left.type == 'Identifier') {
                var variableName = node.expression.left.name;
                if (node.expression.right.type == 'Literal') {
                    var variableValue = node.expression.right.value;
                    var variableDataType = typeof variableValue;
                    return {name: variableName, type: variableDataType};
                }
                if (node.expression.right.type == 'Identifier') {
                    var variableValue = node.expression.right.value;
                    var variableDataType = typeof variableValue;

                    return {name: variableName, type: variableDataType};
                }
                if (node.expression.right.type == 'ObjectExpression') {
                    var objectProperties = new Array();
                    for (var j = 0; j < node.expression.right.properties.length; j++) {
                        var name = node.expression.right.properties[j].key.name;
                        var value = node.expression.right.properties[j].value.value;
                        var type = typeof value;
                        objectProperties.push(new controllerEntity.property(name, value, type));
                    }
                    return {name: variableName, type: "objects"};
                }
                if (node.expression.right.type == 'ArrayExpression') {
                    var elements = node.expression.right.elements;
                    var elementProperties = new Array();
                    for (var k = 0; k < elements.length; k++) {
                        var value = elements[k].value;
                        var type = typeof value;
                        elementProperties.push(new controllerEntity.element(value, type));
                    }
                    return {name: variableName, type: "array"};
                }
                if (node.expression.right.type == 'CallExpression') {
                    //ToDo
                }
                if (node.expression.right.type == 'ReturnStatement') {
                    return;
                }
            }
        }
    }
}







