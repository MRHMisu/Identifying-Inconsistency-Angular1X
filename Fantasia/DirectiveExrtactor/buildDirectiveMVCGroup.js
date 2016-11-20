module.exports.getDirectiveMVCGroup = getDirectiveMVCGroup;

var Colone = require('clone');
var ControllerParser = require('../ControllerExtractor/ControllerParser_NodeJS');
var ViewParser = require('../ViewExtractor/ViewParser_NodeJS');
var directiveParser = require('./directiveParser');
var DirectiveEntity = require('./Directive_Entity');
var parsedDirectives = [];
var directiveMVCStructure = [];


function getDirectiveMVCGroup(requiredFiles) {
    getDirectiveViewAndController(requiredFiles.directiveFiles);
    var primaryMvcGroup = getPrimaryMVCGroup(directiveMVCStructure, requiredFiles);
    var mvcGroup = buildMVCGroup(primaryMvcGroup);
}


function extractDirective(directiveFiles) {
    for (var i = 0; i < directiveFiles.length; i++) {
        var directive = directiveFiles[i];
        var parsedDirective = directiveParser.getParsedDirective(directive.content);
        parsedDirective['name'] = directive.name.split(".directive.js")[0];
        parsedDirectives.push(Colone(parsedDirective));
    }
}

function getDirectiveViewAndController(directiveFiles) {
    extractDirective(directiveFiles);
    for (var i = 0; i < parsedDirectives.length; i++) {
        var parsedDirective = parsedDirectives[i];
        if (parsedDirective.bindToController) {
            var directiveName = parsedDirective.name;
            var alice = parsedDirective.controllerAs;
            var viewFile = parsedDirective.templateUrl.split('/')[1];
            var controllerFile = parsedDirective.controller.split('Controller')[0] + ".controller.js";
            var scope = parsedDirective.scope;
            directiveMVCStructure.push(new DirectiveEntity.DirectiveMVCStructure(directiveName, alice, viewFile, controllerFile, scope));
        }
    }
}

function getPrimaryMVCGroup(directiveMVCStructure, requiredFiles) {
    var primaryMVCGroup = [];
    for (var i = 0; i < directiveMVCStructure.length; i++) {

        var directiveMVCStructures = directiveMVCStructure[i];
        var directiveName = directiveMVCStructures.directiveName;
        var scope = directiveMVCStructures.scope;
        var controllerName = '';
        var controllerCode = '';
        var viewName = '';
        var viewCode = '';
        for (var j = 0; j < requiredFiles.controllerFiles.length; j++) {
            if (requiredFiles.controllerFiles[j].name.indexOf(directiveMVCStructures.controllerFileName) > -1) {
                controllerName = requiredFiles.controllerFiles[j].name;
                controllerCode = requiredFiles.controllerFiles[j].content;
            }
        }
        for (var k = 0; k < requiredFiles.viewFiles.length; k++) {
            if (requiredFiles.viewFiles[k].name.indexOf(directiveMVCStructures.viewFileName) > -1) {
                viewName = requiredFiles.viewFiles[k].name;
                viewCode = requiredFiles.viewFiles[k].content;
            }
        }
        primaryMVCGroup.push(new DirectiveEntity.PrimaryMVCGroupForDirective(directiveName, scope, controllerName, controllerCode, viewName, viewCode));
    }
    return primaryMVCGroup;
}

function buildMVCGroup(primaryMVCGroups) {
    var MVCGroup = [];
    for (var i = 0; i < primaryMVCGroups.length; i++) {
        var directiveName = primaryMVCGroups[i].directiveName;
        var scope = primaryMVCGroups[i].scope;
        var controllerName = primaryMVCGroups[i].controllerName;
        var extractedController = ControllerParser.getParsedController(primaryMVCGroups[i].controllerCode);
        var viewName = primaryMVCGroups[i].viewName;
        var extractedView = ViewParser.getParsedView(primaryMVCGroups[i].viewCode);
        MVCGroup.push(new DirectiveEntity.MVCGroupForDirective(directiveName, scope, controllerName, extractedController, viewName, extractedView));
    }
    return MVCGroup;
}