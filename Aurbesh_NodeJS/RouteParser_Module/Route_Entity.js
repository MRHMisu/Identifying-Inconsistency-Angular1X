module.exports.route=route;

function route(controller, templateUrl, controllerAs) {
    this.controller = controller;
    this.templateUrl = templateUrl;
    this.controllerAs = controllerAs;

}