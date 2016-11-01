/**
 * Created by Fantasia on 11/1/2016.
 */

var test = require('./XDOMParser');
var fileSystem = require('fs');

fileSystem.readFile('demoview.txt', 'utf8', readData);
function readData(error, data) {
    if (error) {
        return console.log(error);
    }
    var viewData = data;
    var list = test.getParsedView(viewData);
    console.log(list.modelvariables.length);
    console.log(list.controllerFunctions.length);


}

