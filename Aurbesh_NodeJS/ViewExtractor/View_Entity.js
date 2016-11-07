module.exports.ModelVariableInView = ModelVariableInView;
module.exports.ControllerFunctionInView = ControllerFunctionInView;
module.exports.NG_ReapteElementsInView = NG_ReapteElementsInView;
module.exports.isExsistInArray = isExsistInArray;

function ModelVariableInView(directive, dataType, lineNumber, modelVariableName) {
    this.directive = directive;
    this.dataType = dataType;
    this.lineNumber = lineNumber;
    this.modelVariableName = modelVariableName;

}


function isEquivalentModelVariableInView(objectOne, objectTwo) {
    var objectOneProperties = Object.getOwnPropertyNames(objectOne);
    var objectTwoProperties = Object.getOwnPropertyNames(objectTwo);
    if (objectOneProperties.length != objectTwoProperties.length) {
        return false;
    }
    for (var i = 0; i < objectOneProperties.length; i++) {
        var propName = objectOneProperties[i];
        if (objectOne[propName] !== objectTwo[propName]) {
            return false;
        }
    }
    return true;
}

function isExsistInArray(array, object) {
    for (var i = 0; i < array.length; i++) {
        var objectInArray = array[i];
        if (compareToModelVariableInView(objectInArray, object))true;
        else false;
    }
}


function compareToModelVariableInView(objOne, objTwo) {
    if (!(objOne.directive === objTwo.directive))return false;
    else if (!(objOne.dataType === objTwo.dataType))return false;
    else if (!(objOne.lineNumber === objTwo.lineNumber))return false;
    else if (!(objOne.modelVariableName === objTwo.modelVariableName))return false;
    return true;
}


function ControllerFunctionInView(directive, dataType, controllerFunctionName, lineNumber) {
    this.directive = directive;
    this.dataType = dataType;
    this.controllerFunctionName = controllerFunctionName;
    this.lineNumber = lineNumber;
}

function NG_ReapteElementsInView(arrayName, alice, value) {
    this.arrayName = arrayName;
    this.alice = alice;
    this.value = value;

}
