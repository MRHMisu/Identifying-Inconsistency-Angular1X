module.exports.modelVariable = modelVariable;
module.exports.modelVariableArray = modelVariableArray;
module.exports.element = element;
module.exports.controllerFunction = controllerFunction;
module.exports.property = property;
module.exports.ParsedController=ParsedController;


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

function ParsedController(viewModelIdentifier, modelVariableList, controllerFunctionList, modelVariableArrayList) {

    this.viewModelIdentifier = viewModelIdentifier;
    this.modelVariableList = modelVariableList;
    this.controllerFunctionList = controllerFunctionList;
    this.modelVariableArrayList = modelVariableArrayList;

}