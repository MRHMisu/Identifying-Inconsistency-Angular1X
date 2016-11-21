module.exports.getParsedController = getParsedController;
var esprima = require('esprima');
var estraverse = require('estraverse');
var controllerEntity = require('./Controller_Entity.js');
var Colone = require('clone');

var viewModelIdentifier = {};
var vm_VariableList = [];
var modelVariableList = [];
var modelVariableArrayList = [];
var functionList = [];
var controllerFunctionList = [];
var uniqueModelVariableList = [];
var uniqueControllerFunction = [];

function getParsedController(code) {
    getJavaScriptCode(code);
    getControllerFunctionListFromModelAssingmentVariable();
    getUpdatedModelVariables();
    getUniqueModelVariableList();
    getUniqueControllerFunctionList();
    var copy_viewModelIdentifier = Colone(viewModelIdentifier);
    var copy_uniqueModelVariableList = Colone(uniqueModelVariableList);
    var copy_uniqueControllerFunction = Colone(uniqueControllerFunction);
    var copy_modelVariableArrayList = Colone(modelVariableArrayList);
    reinitializeAllGlobalObject();
    return {
        'viewModelIdentifier': copy_viewModelIdentifier,
        'modelVariableList': copy_uniqueModelVariableList,
        'controllerFunctionList': copy_uniqueControllerFunction,
        'modelVariableArrayList': copy_modelVariableArrayList
    }
}

function reinitializeAllGlobalObject() {
    vm_VariableList = [];
    modelVariableList = [];
    functionList = [];
    controllerFunctionList = [];
    viewModelIdentifier = {};
    uniqueModelVariableList = [];
    uniqueControllerFunction = [];
    modelVariableArrayList = [];
}


//MV
function getUniqueModelVariableList() {
    var copiedMVList = copyArray(modelVariableList);
    for (var i = 0; i < copiedMVList.length; i++) {
        if (!(isContainMV(copiedMVList[i]))) {
            uniqueModelVariableList.push(copiedMVList[i]);
        }
    }
}

function copyArray(fromArray) {
    var array = [];
    for (var i = 0; i < fromArray.length; i++) {
        array.push(fromArray[i]);
    }
    return array;
}

function isContainMV(object) {
    for (var i = 0; i < uniqueModelVariableList.length; i++) {
        if (compareToModelVariableInController(uniqueModelVariableList[i], object))return true;
    }
    return false;
}

function compareToModelVariableInController(objOne, objTwo) {
    if (!(objOne.value === objTwo.value))return false;
    if (!(objOne.dataType === objTwo.dataType))return false;
    if (!(objOne.lineNumber === objTwo.lineNumber))return false;
    if (!(objOne.modelVariableName === objTwo.modelVariableName))return false;
    return true;
}

//CF
function getUniqueControllerFunctionList() {
    var copiedMVList = copyArray(controllerFunctionList);
    for (var i = 0; i < copiedMVList.length; i++) {
        if (!(isContainCF(copiedMVList[i]))) {
            uniqueControllerFunction.push(copiedMVList[i]);
        }
    }
}

function isContainCF(object) {
    for (var i = 0; i < uniqueControllerFunction.length; i++) {
        if (compareToControllerFunctionInController(uniqueControllerFunction[i], object))return true;
    }
    return false;
}

function compareToControllerFunctionInController(objOne, objTwo) {
    if (!(objOne.returnType === objTwo.returnType))return false;
    if (!(objOne.startLineNumber === objTwo.startLineNumber))return false;
    if (!(objOne.endLineNumber === objTwo.endLineNumber))return false;
    if (!(objOne.controllerFunctionName === objTwo.controllerFunctionName))return false;
    return true;
}


function getJavaScriptCode(code) {
    var jsRawCode = code// document.getElementById('textEditor').value;
    var ast = esprima.parse(jsRawCode, {loc: true, tokens: true});
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            isViewModelThisExpression(node);
            getViewModelVariables(node);
            getAllFunctionalExpression(node);

        }
    });
}


function getControllerFunctionListFromModelAssingmentVariable() {
    for (var i = 0; i < functionList.length; i++) {
        var cfName = functionList[i].controllerFunctionName;
        var regx = eval('/' + cfName + '/g');
        for (var j = 0; j < vm_VariableList.length; j++) {
            if (regx.exec(vm_VariableList[j].value)) {

                functionList[i].controllerFunctionName = vm_VariableList[j].modelVariableName;
                functionList[i].endLineNumber = vm_VariableList[j].lineNumber;
                controllerFunctionList.push(functionList[i]);
            }
        }
    }
}

function getUpdatedModelVariables() {
    for (var i = 0; i < vm_VariableList.length; i++) {
        var vm_variableName = vm_VariableList[i].modelVariableName;
        var regx = eval('/' + vm_variableName + '/g');
        for (var j = 0; j < controllerFunctionList.length; j++) {
            if ((regx.exec(controllerFunctionList[j].controllerFunctionName))) {
                var prefix = vm_VariableList[i].modelVariableName.split('.')[0];
                if (prefix === "vm" || prefix === viewModelIdentifier.name) {
                    vm_VariableList[i] = null;
                }
            }
        }
    }
    for (var k = 0; k < vm_VariableList.length; k++) {
        if (vm_VariableList[k] != null) {
            modelVariableList.push(vm_VariableList[k]);
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
        return vm_VariableList.push(new controllerEntity.modelVariable(viewModelIdentifier, variableValue, variableDataType, lineNumber));
    }
    if (node.right.type == 'Literal') {
        var variableValue = node.right.value;
        var lineNumber = node.right.loc.end.line;
        var variableDataType = typeof variableValue;
        return vm_VariableList.push(new controllerEntity.modelVariable(viewModelIdentifier, variableValue, variableDataType, lineNumber));
    }
    if (node.right.type == 'ObjectExpression') {
        var objectProperties = new Array();
        for (var j = 0; j < node.right.properties.length; j++) {
            var variableName = viewModelIdentifier + '.' + node.right.properties[j].key.value;
            var variableValue = node.right.properties[j].value.value;
            var variableDataType = typeof variableValue;
            var lineNumber = node.right.properties[j].loc.end.line;
            vm_VariableList.push(new controllerEntity.modelVariable(variableName, variableValue, variableDataType, lineNumber));
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
        var variableName =viewModelIdentifier;
        var variableValue = "CallExpression";
        var variableDataType = "functionCall";
        var lineNumber = node.right.loc.end.line;
        return vm_VariableList.push(new controllerEntity.modelVariable(variableName, variableValue, variableDataType, lineNumber));

    }
    if(node.right.type=='MemberExpression')
    {
        var variableName =viewModelIdentifier;
        var variableValue = "MemberExpression";
        var variableDataType = "Object";
        var lineNumber = node.right.loc.end.line;
        return vm_VariableList.push(new controllerEntity.modelVariable(variableName, variableValue, variableDataType, lineNumber));

    }
    /*if (node.right.type == 'FunctionExpression' || node.right.type == 'FunctionDeclaration') {
     getAllFunctionalExpression(node);
     }*/

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
                    return;
                }
                if (node.expression.right.type == 'ReturnStatement') {
                    return;
                }
            }
        }
    }
}




