module.exports.DirectiveMVCStructure = DirectiveMVCStructure;
module.exports.MVCGroupForDirective = MVCGroupForDirective;
module.exports.PrimaryMVCGroupForDirective = PrimaryMVCGroupForDirective;

function DirectiveMVCStructure(directiveName, alice, viewFileName, controllerFileName, scope) {
    this.directiveName = directiveName;
    this.alice = alice;
    this.scope = scope;
    this.viewFileName = viewFileName;
    this.controllerFileName = controllerFileName;

}
function PrimaryMVCGroupForDirective(directiveName, scope, controllerName, controllerCode, viewName, viewCode) {

    this.directiveName = directiveName;
    this.scope = scope;
    this.controllerName = controllerName,
        this.controllerCode = controllerCode,
        this.viewName = viewName,
        this.viewCode = viewCode

}
function MVCGroupForDirective(directiveName, scope, controllerName, extractedController, viewName, extractedView) {
    this.directiveName = directiveName;
    this.scope = scope;
    this.controllerName = controllerName,
        this.extractedController = extractedController,
        this.viewName = viewName,
        this.extractedView = extractedView

}