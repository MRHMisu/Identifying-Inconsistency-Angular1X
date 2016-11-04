/**
 * Created by Misu Be Imp on 11/4/2016.
 */


module.exports.MVCGroup=MVCGroup;
module.exports.PrimaryMVCGroup=PrimaryMVCGroup;

function PrimaryMVCGroup(controllerName, controllerCode, viewName, viewCode) {

    this.controllerName = controllerName,
        this.controllerCode = controllerCode,
        this.viewName = viewName,
        this.viewCode = viewCode

}
function MVCGroup(controllerName, extractedController, viewName, extractedView) {

    this.controllerName = controllerName,
        this.extractedController = extractedController,
        this.viewName = viewName,
        this.extractedView = extractedView

}