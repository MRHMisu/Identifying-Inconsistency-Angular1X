module.exports.getMVCGroupList=getMVCGroupList;

var fileContentReader = require('../ComponentCollector/FileContentReader.js');
var routeParser = require('../RouteExtractor/RouteParser.js');
var MVCGroup_Entity = require('./MVCGroup_Entity.js');
var ControllerParser = require('../ControllerExtractor/ControllerParser_NodeJS');
var ViewParser = require('../ViewExtractor/ViewParser_NodeJS');


//"D:\\My Research Work\\Angular js App DataSet\\01_Refactor app in visual studio code\\Kodigon (Structure OK)";
getMVCGroupList();
var l=0;
function getMVCGroupList() {

    var applicationDirectorypath = "D:\\My Research Work\\Angular js App DataSet\\1_Refactor App\\Cafe";

    var requiredFiles = fileContentReader.getRequiredFiles(applicationDirectorypath);
    var parsedRoutes = routeParser.getParsedRoute(requiredFiles.configFile[0].content);
    var primaryMVCGroups = getPrimaryMVCGroup(parsedRoutes, requiredFiles);
    var MVCGroups = buildMVCGroup(primaryMVCGroups);
    return MVCGroups;
}



function buildMVCGroup(primaryMVCGroups) {

    var MVCGroup = [];
    for (var i = 0; i < primaryMVCGroups.length; i++) {
        var controllerName = primaryMVCGroups[i].controllerName;
        var extractedController = ControllerParser.getParsedController(primaryMVCGroups[i].controllerCode);
        var viewName = primaryMVCGroups[i].viewName;
        var extractedView = ViewParser.getParsedView(primaryMVCGroups[i].viewCode);

        MVCGroup.push(new MVCGroup_Entity.MVCGroup(controllerName, extractedController, viewName, extractedView));
    }
    return MVCGroup;
}

function getPrimaryMVCGroup(parsedRoutes, requiredFiles) {
    var primaryMVCGroup = [];
    for (var i = 0; i < parsedRoutes.length; i++) {
        var route = parsedRoutes[i];
        var controllerName = '';
        var controllerCode = '';
        var viewName = '';
        var viewCode = '';
        for (var j = 0; j < requiredFiles.controllerFiles.length; j++) {
            if (requiredFiles.controllerFiles[j].name.indexOf(route.controller) > -1) {
                controllerName = requiredFiles.controllerFiles[j].name;
                controllerCode = requiredFiles.controllerFiles[j].content;
            }
        }
        for (var k = 0; k < requiredFiles.viewFiles.length; k++) {
            if (requiredFiles.viewFiles[k].name.indexOf(route.templateUrl) > -1) {
                viewName = requiredFiles.viewFiles[k].name;
                viewCode = requiredFiles.viewFiles[k].content;
            }
        }
        primaryMVCGroup.push(new MVCGroup_Entity.PrimaryMVCGroup(controllerName, controllerCode, viewName, viewCode));
    }
    return primaryMVCGroup;
}