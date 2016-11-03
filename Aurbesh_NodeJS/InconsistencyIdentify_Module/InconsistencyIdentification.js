/**
 * Created by Fantasia on 11/2/2016.
 */



var unusedModelVariable = [];
var unusedControllerFunction = [];
var modelVariableInController = [{
    value: 'ng-model',
    dataType: 'boolean',
    lineNumber: 18,
    modelVariableName: 'employee.firstName'
}];

var modelVariableInView = [{

    directive: 'ng-model',
    dataType: 'boolean',
    lineNumber: 18,
    modelVariableName: 'employee.firstNameee'

}];

getRedundantModelVariableList(modelVariableInController, modelVariableInView);


function getRedundantModelVariableList(modelVariableInController, modelVariableInView) {
    for (var i = 0; i < modelVariableInController.length; i++) {
        for (var j = 0; j < modelVariableInView.length; j++) {
            var controllerModelVariable = modelVariableInController[i];
            var viewModelVariable = modelVariableInView[j];
            if (viewModelVariable.modelVariableName.indexOf(controllerModelVariable.modelVariableName) > -1) {
                // String viewModelVariable.modelVariableName contains String controllerModelVariable.name
                if (!(viewModelVariable.modelVariableName === controllerModelVariable.modelVariableName)) {
                    unusedModelVariable.push(controllerModelVariable);
                }
            }
            if (controllerModelVariable.modelVariableName.indexOf(viewModelVariable.modelVariableName) > -1) {
                // String controllerModelVariable.name contains String viewModelVariable.modelVariableName
                if (!(controllerModelVariable.modelVariableName === viewModelVariable.modelVariableName)) {
                    unusedModelVariable.push(controllerModelVariable);
                }
                unusedModelVariable.push(controllerModelVariable);
            }

        }
    }
}

function getRedundantControllerFunction(CFInController, CFInView) {
    for (var i = 0; i < CFInController.length; i++) {
        for (var j = 0; j < CFInView.length; j++) {
            var cFINController = CFInController[i];
            var cFINView = CFInView[j];
            if (cFINView.controllerFunctionName.indexOf(cFINController.controllerFunctionName) > -1) {
                if (!(cFINView.controllerFunctionName === cFINController.controllerFunctionName)) {
                    unusedControllerFunction.push(cFINController);
                }
            }
            if (cFINController.controllerFunctionName.indexOf(cFINView.controllerFunctionName) > -1) {
                if (!(cFINController.controllerFunctionName === cFINView.controllerFunctionName)) {
                    unusedControllerFunction.push(cFINController);
                }

            }

        }
    }
}


