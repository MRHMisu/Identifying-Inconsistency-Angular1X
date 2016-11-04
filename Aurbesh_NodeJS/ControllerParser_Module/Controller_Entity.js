/**
 * Created by Misu Be Imp on 11/4/2016.
 */

module.exports.modelVariable = modelVariable;
module.exports.modelVariableArray = modelVariableArray;
module.exports.element = element;
module.exports.controllerFunction = controllerFunction;
module.exports.property = property;

function modelVariable(modelVariableName, value, dataType, lineNumber) {
    this.modelVariableName = modelVariableName;
    this.value = value;
    this.dataType = dataType;
    this.lineNumber = lineNumber;
}
function modelVariableArray(identiferName, singularName, elementProperties, lineNumber) {
    this.identiferName = identiferName;
    this.singularName = singularName;
    this.elementProperties = elementProperties;
    this.lineNumber = lineNumber;
}
function element(value, type) {
    this.value = value;
    this.type = type;
}
function controllerFunction(controllerFunctionName, returnType, startLineNumber, endLineNumber) {
    this.controllerFunctionName = controllerFunctionName;
    this.returnType = returnType;
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
}
function property(name, value, type) {
    this.name = name;
    this.value = value;
    this.type = type;
}