module.exports.getParsedView = getParsedView;

var DOMParser = require('xmldom').DOMParser;
var viewEntity = require('./View_Entity.js');
var angularDirectives = require('./angularDirectiveList_Node.js');
var Colone = require('clone');

var angularAttributeDirectiveForControllerFunctions;
var angularAttributeDirectivesForModelValue;

var extractedModelVariableList = [];
var extractedControllerFunctionList = [];
var ngRepeatElements = [];
var uniqueModelVariableList = [];
var uniqueControllerFunction = [];


function getParsedView(htmlRawCode) {
    angularAttributeDirectiveForControllerFunctions = angularDirectives.getAngularAttributeDirectiveForControllerFunctionsList();
    angularAttributeDirectivesForModelValue = angularDirectives.getAngularAttributeDirectivesForModelValue();
    getHTMLCode(htmlRawCode);
    getUniqueModelVariableList();
    getUniqueControllerFunctionList();

    var extractedModelVariableList = [];
    var extractedControllerFunctionList = [];
    var copy_ngRepeatElements = Colone(ngRepeatElements);
    var copy_uniqueModelVariableList = Colone(uniqueModelVariableList);
    var copy_uniqueControllerFunction = Colone(uniqueControllerFunction);
    reInitilizeAllGlobalVariable();
    return {
        'modelVariableList': copy_uniqueModelVariableList,
        'controllerFunctionList': copy_uniqueControllerFunction,
        'ngRepeatElements': copy_ngRepeatElements
    }
}

function reInitilizeAllGlobalVariable() {
    extractedModelVariableList = [];
    extractedControllerFunctionList = [];
    ngRepeatElements = []
    uniqueModelVariableList = []
    uniqueControllerFunction = [];

}
//MV
function getUniqueModelVariableList() {
    var copiedMVList = copyArray(extractedModelVariableList);
    for (var i = 0; i < copiedMVList.length; i++) {
        if (!(isContainMV(copiedMVList[i]))) {
            uniqueModelVariableList.push(copiedMVList[i]);
        }
    }
}
function copyArray(fromArray) {
    var array = [];
    for (var i = 0; i < fromArray.length; i++) {
        array.push(fromArray[i]);
    }
    return array;
}
function isContainMV(object) {
    for (var i = 0; i < uniqueModelVariableList.length; i++) {
        if (compareToModelVariableInView(uniqueModelVariableList[i], object))return true;
    }
    return false;
}
function compareToModelVariableInView(objOne, objTwo) {
    if (!(objOne.directive === objTwo.directive))return false;
    if (!(objOne.dataType === objTwo.dataType))return false;
    if (!(objOne.lineNumber === objTwo.lineNumber))return false;
    if (!(objOne.modelVariableName === objTwo.modelVariableName))return false;
    return true;
}
//CF
function getUniqueControllerFunctionList() {
    var copiedMVList = copyArray(extractedControllerFunctionList);
    for (var i = 0; i < copiedMVList.length; i++) {
        if (!(isContainCF(copiedMVList[i]))) {
            uniqueControllerFunction.push(copiedMVList[i]);
        }
    }
}
function isContainCF(object) {
    for (var i = 0; i < uniqueControllerFunction.length; i++) {
        if (compareToControllerFunctionInView(uniqueControllerFunction[i], object))return true;
    }
    return false;
}
function compareToControllerFunctionInView(objOne, objTwo) {
    if (!(objOne.directive === objTwo.directive))return false;
    if (!(objOne.dataType === objTwo.dataType))return false;
    if (!(objOne.lineNumber === objTwo.lineNumber))return false;
    if (!(objOne.controllerFunctionName === objTwo.controllerFunctionName))return false;
    return true;
}
//Parsing
function getHTMLCode(htmlRawCode) {

    var htmlRawCode = htmlRawCode;
    var parsedDOM = new DOMParser().parseFromString(htmlRawCode, "text/html");
    getModelVariables(parsedDOM, htmlRawCode);
    getControllerFunctions(parsedDOM, htmlRawCode);
    getNGRepeatElements(parsedDOM, htmlRawCode);
    getAngularExpressionDirective(htmlRawCode, parsedDOM);

}
function getLineNumberOfTheSignature(signature, htmlRawCode) {
    var lineNumber = [];
    var splitedHtmlRawCode = htmlRawCode.split("\n");
    for (var i = 0; i < splitedHtmlRawCode.length; i++) {
        if (splitedHtmlRawCode[i].includes(signature) > 0) {
            var lineNo = i + 1;
            lineNumber.push(lineNo);
        }
    }
    return lineNumber;
}
function getAngularExpressionDirective(htmlRawCode, parsedDOM) {
    //get all angular Expression {{*}}
    var allAngularExpression = traversDomNodes(parsedDOM, new Array(), parsedDOM);
    for (var i = 0; i < allAngularExpression.length; i++) {
        var element = allAngularExpression[i];
        if (element.indexOf('.')) {
            var dotNotation = "\\" + "\.";
            element = element.replace(/\./g, dotNotation);
        }

        var attributeValueExpression = getAttributeValueRegularExpression(element);
        var tempMatchList;
        while ((tempMatchList = attributeValueExpression.exec(htmlRawCode)) !== null) {
            var attributeValue = tempMatchList[0];
            var array = attributeValue.split("=");
            var attribute = array[0];
            var value = array[1];
            for (var j = 0; j < angularAttributeDirectivesForModelValue.length; j++) {
                var regModelDirective = angularAttributeDirectivesForModelValue[j].signature;
                var matchModelDirective = eval('/' + regModelDirective + '/g');
                if (matchModelDirective.exec(attribute)) {

                    var directive = angularAttributeDirectivesForModelValue[j].signature;
                    var dataType = angularAttributeDirectivesForModelValue[j].acceptedDatatype;
                    var modelVariableName = value;
                    var lineNumberSignature = directive.signature + '=' + '"' + "{{" + modelVariableName + "}}" + '"';
                    var lineNumber = getLineNumberOfTheSignature(lineNumberSignature, htmlRawCode);
                    for (var k = 0; k < lineNumber.length; k++) {
                        extractedModelVariableList.push(new viewEntity.ModelVariableInView(directive, dataType, lineNumber[k], modelVariableName));
                    }
                }
            }
            for (var l = 0; l < angularAttributeDirectiveForControllerFunctions.length; l++) {
                var regControllerDirective = angularAttributeDirectiveForControllerFunctions[l].signature;
                var matchControllerFunctionDirective = eval('/' + regControllerDirective + '/g');
                if (matchControllerFunctionDirective.exec(attribute)) {
                    var directive = angularAttributeDirectiveForControllerFunctions[j].signature;
                    var dataType = angularAttributeDirectiveForControllerFunctions[j].acceptedDatatype;
                    var controllerFunctionName = value.replace('(', '').replace(')', '').trim();
                    var lineNumberSignature = directive.signature + '=' + '"' + "{{" + controllerFunctionName + "()" + "}}" + '"';
                    var lineNumber = getLineNumberOfTheSignature(lineNumberSignature, htmlRawCode);
                    for (var m = 0; m < lineNumber.length; m++) {
                        extractedControllerFunctionList.push(new viewEntity.ControllerFunctionInView(directive, dataType, lineNumber[m], controllerFunctionName));
                    }

                }
            }
        }

    }

}
function getElementsByAttribute(parsedDOM, attribute) {
    var nodeList = parsedDOM.getElementsByTagName('*');
    var nodeArray = [];
    var iterator = 0;
    var node = null;

    while (node = nodeList[iterator++]) {
        if (node.hasAttribute(attribute)) nodeArray.push(node);
    }

    return nodeArray;
}
function getAttributeValueRegularExpression(value) {
    var firstExpression = '/' + 'ng-' + '\\w*="{{(';
    var lastExpression = ')}}"/g'
    var middleValue = value;
    var expression = eval(firstExpression + middleValue + lastExpression);
    return expression;
}
function getNGRepeatElements(parsedDOM, htmlRawCode) {
    var allNgRepeatElement = getElementsByAttribute(parsedDOM, 'ng-repeat');
    if (allNgRepeatElement != null && allNgRepeatElement.length > 0) {
        for (var i = 0; i < allNgRepeatElement.length; i++) {
            var element = allNgRepeatElement[i].getAttribute('ng-repeat');
            var ngRepeatExpression = element.split("in");
            var alice = ngRepeatExpression[0].trim();
            var modelVariableArray = ngRepeatExpression[1].trim();
            var ngRepeatElement = traversDomNodes(allNgRepeatElement[i], new Array(), allNgRepeatElement[i]);
            for (var l = 0; l < ngRepeatElement.length; l++) {
                //replace
                var replacedElement = ngRepeatElement[l].replace(alice, modelVariableArray);
                ngRepeatElements.push(new viewEntity.NG_ReapteElementsInView(modelVariableArray, alice, replacedElement));
            }
        }
    }
}
function getModelVariables(parsedDOM, htmlRawCode) {
    for (var i = 0; i < angularAttributeDirectivesForModelValue.length; i++) {
        var directive = angularAttributeDirectivesForModelValue[i];
        var elements = getElementsByAttribute(parsedDOM, directive.signature);
        if (elements != null && elements.length > 0) {
            for (var j = 0; j < elements.length; j++) {
                var directiveAttributeModelValue = elements[j].getAttribute(directive.signature);
                directiveAttributeModelValue = directiveAttributeModelValue.replace('!', '').trim();
                var lineNumberSignature = directive.signature + '=' + '"' + directiveAttributeModelValue + '"';
                var lineNumber = getLineNumberOfTheSignature(lineNumberSignature, htmlRawCode);
                for (var k = 0; k < lineNumber.length; k++) {
                    extractedModelVariableList.push(new viewEntity.ModelVariableInView(directive.signature, directive.acceptedDatatype, lineNumber[k], directiveAttributeModelValue.replace(/{{/g, '').replace(/}}/g, '').trim()));
                }
            }
        }
    }
}
function getControllerFunctions(parsedDOM, htmlRawCode) {
    for (var i = 0; i < angularAttributeDirectiveForControllerFunctions.length; i++) {
        var directiveCF = angularAttributeDirectiveForControllerFunctions[i];
        var elements = getElementsByAttribute(parsedDOM, directiveCF.signature);
        if (elements != null && elements.length > 0) {
            for (var j = 0; j < elements.length; j++) {
                var directiveAttributeCFValue = elements[j].getAttribute(directiveCF.signature);
                directiveAttributeCFValue = directiveAttributeCFValue.replace('!', '').trim();
                directiveAttributeCFValue = directiveAttributeCFValue.split('(')[0];
                var lineNumberSignature = directiveCF.signature + '=' + '"' + directiveAttributeCFValue + '"';
                var lineNumber = getLineNumberOfTheSignature(lineNumberSignature, htmlRawCode);
                for (var k = 0; k < lineNumber.length; k++) {
                    extractedControllerFunctionList.push(new viewEntity.ControllerFunctionInView(directiveCF.signature, directiveCF.acceptedDatatype, directiveAttributeCFValue, lineNumber[k]));
                }

            }
        }
    }

}
function traversDomNodes(node, ngRepeatVariableList, theDom) {

    if (node.nodeType == 9) { //nodeType refers  document node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversDomNodes(node.childNodes[i], ngRepeatVariableList, theDom);
        }
    }
    else if (node.nodeType == 3) { //nodeType refers text node
        var angularExpression = /{{(.*)+}}/g;//angular expression pattern {{abc}}
        var textNodeData = node.data;
        var tempMatchList;
        while ((tempMatchList = angularExpression.exec(textNodeData)) !== null) {
            var replaced = tempMatchList[0].replace(/{{/g, '').replace(/}}/g, '').trim();
            ngRepeatVariableList.push(replaced);
        }
    }
    else if (node.nodeType == 1) { //nodeType refers element node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversDomNodes(node.childNodes[i], ngRepeatVariableList, theDom);
        }
    }
    return ngRepeatVariableList;
}



