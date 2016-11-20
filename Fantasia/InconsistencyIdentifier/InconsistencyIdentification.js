var Inconsistency_Entity = require('./Inconsistency_Entity.js');
var MVCGroupBuilder = require('../MVCGroupBulider/MVCGroup_Builder');
var unusedModelVariable = [];
var unusedControllerFunction = [];
var mv_inconsistencyList = [];
var cf_inconsistencyList = [];


getInconsistency();
function getInconsistency() {
    var MVCGroupList = MVCGroupBuilder.getMVCGroupList();
    for (var i = 0; i < MVCGroupList.length; i++) {
        var group = MVCGroupList[i];
        var viewName = group.viewName;
        var controllerName = group.controllerName;
        var modelVariableInController = group.extractedController.modelVariableList;
        var modelVariableInView = group.extractedView.modelVariableList;
        var cfInController = group.extractedController.controllerFunctionList;
        var cfInView = group.extractedView.controllerFunctionList;

        getInconsistencyInModelVariableList(controllerName, modelVariableInController, viewName, modelVariableInView);
        getInconsistencyInControllerFunctionList(controllerName, cfInController, viewName, cfInView);

    }

}


function getInconsistencyInModelVariableList(controllerName, modelVariableInController, viewName, modelVariableInView) {
    for (var i = 0; i < modelVariableInController.length; i++) {
        var controllerModelVariable = modelVariableInController[i];
        for (var j = 0; j < modelVariableInView.length; j++) {
            var viewModelVariable = modelVariableInView[j];
            /*if (viewModelVariable.modelVariableName.indexOf(controllerModelVariable.modelVariableName) > -1) {
             // String viewModelVariable.modelVariableName contains String controllerModelVariable.name
             if (!(viewModelVariable.modelVariableName === controllerModelVariable.modelVariableName)) {
             //identifier inconsistency
             var type = "Identifier inconsistency";
             var occurence = viewModelVariable.modelVariableName + " and " + controllerModelVariable.modelVariableName;
             var whereOccured = viewName + " >> line no: " + viewModelVariable.lineNumber + "and " + controllerName + " >> line no:" +
             controllerModelVariable.lineNumber;
             mv_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));
             } else if (viewModelVariable.modelVariableName === controllerModelVariable.modelVariableName) {
             if (!(viewModelVariable.dataType === 'na')) {
             if (!(viewModelVariable.dataType === controllerModelVariable.dataType)) {
             //data type inconsistency;

             var type = "Type inconsistency";
             var occurence = viewModelVariable.modelVariableName + " and " + controllerModelVariable.modelVariableName;
             var whereOccured = viewName + " >> line no: " + viewModelVariable.lineNumber + "and " + controllerName + " >> line no:" +
             controllerModelVariable.lineNumber;
             mv_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));
             }
             }


             }
             }*/
            if (controllerModelVariable.modelVariableName.indexOf(viewModelVariable.modelVariableName) > -1) {
                // String controllerModelVariable.name contains String viewModelVariable.modelVariableName
                if (!(controllerModelVariable.modelVariableName === viewModelVariable.modelVariableName)) {
                    //unusedModelVariable.push(controllerModelVariable);
                    //identifier inconsistency
                    var type = "Identifier inconsistency";
                    var occurence = controllerModelVariable.modelVariableName + " and " + viewModelVariable.modelVariableName;
                    var whereOccured = controllerName + " >> line no: " + controllerModelVariable.lineNumber + "and " + viewName + " >> line no:" +
                        viewModelVariable.lineNumber;
                    mv_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));
                } else if ((controllerModelVariable.modelVariableName === viewModelVariable.modelVariableName)) {
                    if (!(viewModelVariable.dataType === 'na')) {
                        if (!(controllerModelVariable.dataType === viewModelVariable.dataType)) {
                            //data type inconsistency;
                            var type = "Type inconsistency";
                            var occurence = controllerModelVariable.modelVariableName + " and " + viewModelVariable.modelVariableName;
                            var whereOccured = controllerName + " >> line no: " + controllerModelVariable.lineNumber + "and " + viewName + " >> line no:" +
                                viewModelVariable.lineNumber;
                            mv_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));
                        }
                    }

                }
            }
        }
    }
}

function getInconsistencyInControllerFunctionList(controllerName, CFInController, viewName, CFInView) {
    for (var i = 0; i < CFInController.length; i++) {
        for (var j = 0; j < CFInView.length; j++) {
            var cFINController = CFInController[i];
            var cFINView = CFInView[j];
            /*if (cFINView.controllerFunctionName.indexOf(cFINController.controllerFunctionName) > -1) {
             if (!(cFINView.controllerFunctionName === cFINController.controllerFunctionName)) {
             //identifier inconsistency;
             var type = "Identifier inconsistency";
             var occurence = cFINView.controllerFunctionName + " and " + cFINController.controllerFunctionName;
             var whereOccured = viewName + " >> line no: " + cFINView.lineNumber + "and " + controllerName + " >> line no:" +
             cFINController.startLineNumber + " to " + cFINController.endLineNumber;
             cf_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));

             } else if ((cFINView.controllerFunctionName === cFINController.controllerFunctionName)) {
             if (!(cFINView.dataType === cFINController.returnType)) {
             //datatype inconsistency
             var type = "Type inconsistency";
             var occurence = cFINView.controllerFunctionName + " and " + cFINController.controllerFunctionName;
             var whereOccured = viewName + " >> line no: " + cFINView.lineNumber + "and " + controllerName + " >> line no:" +
             cFINController.startLineNumber + " to " + cFINController.endLineNumber;
             cf_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));
             }

             }
             }*/
            if (cFINController.controllerFunctionName.indexOf(cFINView.controllerFunctionName) > -1) {
                if (!(cFINController.controllerFunctionName === cFINView.controllerFunctionName)) {
                    //identifier inconsistency;
                    var type = "Identifier inconsistency";
                    var occurence = cFINController.controllerFunctionName + " and " + cFINView.controllerFunctionName;
                    var whereOccured = cFINController + " >> line no: " + cFINView.lineNumber + "and " + controllerName + " >> line no:" +
                        cFINController.startLineNumber + " to " + cFINController.endLineNumber;
                    cf_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));

                } else if ((cFINController.controllerFunctionName === cFINView.controllerFunctionName)) {
                    if (!(cFINView.dataType === 'na')) {
                        if ((cFINController.returnType === cFINView.dataType)) {
                            //datatype inconsistency
                            var type = "Type inconsistency";
                            var occurence = cFINController.controllerFunctionName + " and " + cFINView.controllerFunctionName;
                            var whereOccured = viewName + " >> line no: " + cFINView.lineNumber + "and " + controllerName + " >> line no:" +
                                cFINController.startLineNumber + " to " + cFINController.endLineNumber;
                            cf_inconsistencyList.push(new Inconsistency_Entity.inconsistency(type, occurence, whereOccured));
                        }
                    }

                }
            }
        }
    }
}
