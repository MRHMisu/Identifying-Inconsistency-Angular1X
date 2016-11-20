module.exports.ModelVariableInView = ModelVariableInView;
module.exports.ControllerFunctionInView = ControllerFunctionInView;
module.exports.NG_ReapteElementsInView = NG_ReapteElementsInView;

function ModelVariableInView(directive, dataType, lineNumber, modelVariableName) {
    this.directive = directive;
    this.dataType = dataType;
    this.lineNumber = lineNumber;
    this.modelVariableName = modelVariableName;

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
