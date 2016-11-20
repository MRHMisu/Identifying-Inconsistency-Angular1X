module.exports.getMVCGroupList = getMVCGroupList;
var DOMParser = require('xmldom').DOMParser;
var fileContentReader = require('../ComponentCollector/FileContentReader.js');
var routeParser = require('../RouteExtractor/RouteParser.js');
var MVCGroup_Entity = require('./MVCGroup_Entity.js');
var ControllerParser = require('../ControllerExtractor/ControllerParser_NodeJS');
var ViewParser = require('../ViewExtractor/ViewParser_NodeJS');

getMVCGroupList();
var l = 0;
function getMVCGroupList() {

    var applicationDirectoryPath ="D:\\My Research Work\\AngularJSMVCAppDataSet\\01_Refactor app in visual studio code\\Balance Projector (Refactor Done )"
    var requiredFiles = fileContentReader.getRequiredFiles(applicationDirectoryPath);
    var parsedRoutes = routeParser.getParsedRoute(requiredFiles.configFile[0].content);
    var primaryMVCGroups = getPrimaryMVCGroup(parsedRoutes, requiredFiles);
    getUpdatedPrimaryMVCGroupsWithDirectives(primaryMVCGroups,requiredFiles);

    var MVCGroups = buildMVCGroup(primaryMVCGroups);
    return MVCGroups;
}

/*
function getUpdatedPrimaryMVCGroupsWithDirectives(primaryMVCGroups, requiredFiles) {
    for (var i = 0; i < requiredFiles.directiveFiles.length; i++) {
        var file = requiredFiles.directiveFiles[i];
        var directiveName = file.name.split('.directive.js')[0];
        var directiveTag = getDirectiveTag(directiveName);
        for (var j = 0; j < primaryMVCGroups.length; j++) {
            var group = primaryMVCGroups[0];
            var htmlRawCode = group.viewCode;
            if(htmlRawCode.test(directiveTag))
            {

            }

            //var parsedDOM = new DOMParser().parseFromString(htmlRawCode, "text/html");
            //var dir = parsedDOM.getElementsByTagName(directiveTag.toUpperCase())[0];*!/

        }
    }
}
*/

function getDirectiveTag(directiveName) {
    var tag = directiveName.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
        return str.toLowerCase();
    });
    tag = tag.split(' ').join('-').toLowerCase();
    console.log(tag);
    return tag;
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