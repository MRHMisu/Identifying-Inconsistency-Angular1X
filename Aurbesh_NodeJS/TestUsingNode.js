/**
 * Created by Fantasia on 11/1/2016.
 */


var fileSystem = require('fs');
var viewParser = require('./ViewExtractor/ViewParser_NodeJS');
var controllerParser = require('./ControllerExtractor/ControllerParser_NodeJS');

var viewData = fileSystem.readFileSync('demoview.txt').toString();
var controllerData = fileSystem.readFileSync('democontroller.txt').toString();

getView(viewData);
//getController(controllerData);


function getView(viewData) {
    var viewData = viewData;
    var View = viewParser.getParsedView(viewData);
    console.log(View.modelVariableList.length);
    for (var i = 0; i < View.modelVariableList.length; i++) {
        console.log(View.modelVariableList[i]);
    }
    console.log(View.controllerFunctionList.length);
    for (var i = 0; i < View.controllerFunctionList.length; i++) {
        console.log(View.controllerFunctionList[i]);
    }
}


function getController(controllerData) {
    var controllerData = controllerData;
    var Controller = controllerParser.getParsedController(controllerData);
    console.log(Controller.modelVariableList.length);
    for (var i = 0; i < Controller.modelVariableList.length; i++) {
        console.log(Controller.modelVariableList[i]);
    }
    console.log(Controller.controllerFunctionList.length);
    for (var i = 0; i < Controller.controllerFunctionList.length; i++) {
        console.log(Controller.controllerFunctionList[i]);
    }
}




