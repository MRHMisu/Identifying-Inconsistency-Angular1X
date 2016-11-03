/**
 * Created by Misu Be Imp on 11/4/2016.
 */


module.exports.route=route;

function route(controller, templateUrl, controllerAs) {
    this.controller = controller;
    this.templateUrl = templateUrl;
    this.controllerAs = controllerAs;

}