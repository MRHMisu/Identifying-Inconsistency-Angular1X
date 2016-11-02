/**
 * Created by Fantasia on 11/1/2016.
 */

var test = require('./XDOMParser');
var fileSystem = require('fs');

fileSystem.readFile('demoview.txt', 'utf8', readData);

function readData(error, viewData) {
    if (error) {
        return console.log(error);
    }
    var viewData = viewData;
    var list = test.getParsedView(viewData);
    console.log(list.modelvariables.length);
    for (var i = 0; i < list.modelvariables.length; i++) {
        console.log(list.modelvariables[i]);
    }
    console.log(list.controllerFunctions.length);
    for (var i = 0; i < list.controllerFunctions.length; i++) {
        console.log(list.controllerFunctions[i]);
    }
}


