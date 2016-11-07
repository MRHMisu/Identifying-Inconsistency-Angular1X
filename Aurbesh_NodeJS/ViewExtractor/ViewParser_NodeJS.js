module.exports.getParsedView = getParsedView;

var DOMParser = require('xmldom').DOMParser;
var viewEntity = require('./View_Entity.js');
var angularDirectives = require('./angularDirectiveList_Node.js');

var extractedModelVariableList = [];
var modelVariableList = [];
var controllerFunctionList = [];
var ngRepeatElements = [];
var angularAttributeDirectiveForControllerFunctions;
var angularAttributeDirectivesForModelValue;

function getParsedView(htmlRawCode) {

    angularAttributeDirectiveForControllerFunctions = angularDirectives.getAngularAttributeDirectiveForControllerFunctionsList();
    angularAttributeDirectivesForModelValue = angularDirectives.getAngularAttributeDirectivesForModelValue();
    getHTMLCode(htmlRawCode);
    getUpdatedModelVariables();
    modelVariableList = getUpdatedModelVariables();

    return {
        'modelVariableList': modelVariableList,
        'controllerFunctionList': controllerFunctionList,
        'ngRepeatElements': ngRepeatElements
    }
}


//modelVariableList




function getUpdatedModelVariables() {
    var updatedList = [];
    for (var i = 0; i < extractedModelVariableList.length; i++) {
        var modelVariable = extractedModelVariableList[i];
        if (!(viewEntity.isExsistInArray(updatedList, modelVariable))) {
            updatedList.push(modelVariable);
        }

    }
    return updatedList;
}

function getHTMLCode(htmlRawCode) {

    var htmlRawCode = htmlRawCode;//document.getElementById('textEditor').value;
    var parsedDOM = new DOMParser().parseFromString(htmlRawCode, "text/html");
    getModelVariables(parsedDOM, htmlRawCode);
    getControllerFunctions(parsedDOM, htmlRawCode);
    getNGRepeatElements(parsedDOM, htmlRawCode);
    getAngularExpressionDirective(htmlRawCode, parsedDOM);
    //viewModel_VariableList=removeModelObject(viewModel_VariableList);

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
            for (var j = 0; j < htmlRawCode.length; j++) {
                var regModelDirective = angularAttributeDirectivesForModelValue[j].signature;
                var matchModelDirective = eval('/' + regModelDirective + '/g');
                if (matchModelDirective.exec(attribute)) {
                    var modelDirective = htmlRawCode[j];
                    var attributeModelValue = value;
                    extractedModelVariableList.push(new viewEntity.ModelVariableInView(modelDirective.signature, modelDirective.acceptedDatatype, attributeModelValue));

                }
            }
            for (var k = 0; k < angularAttributeDirectiveForControllerFunctions.length; k++) {
                var regControllerDirective = angularAttributeDirectiveForControllerFunctions[k].signature;
                var matchControllerFunctionDirective = eval('/' + regControllerDirective + '/g');
                if (matchControllerFunctionDirective.exec(attribute)) {
                    var CFDirective = angularAttributeDirectiveForControllerFunctions[k];
                    var attributeCFValue = value;
                    extractedModelVariableList.push(new viewEntity.ControllerFunctionInView(CFDirective.signature, CFDirective.acceptedDatatype, attributeCFValue));
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
                directiveAttributeCFValue=directiveAttributeCFValue.replace('(','').replace(')','').trim();
                var lineNumberSignature = directiveCF.signature + '=' + '"' + directiveAttributeCFValue + '"';
                var lineNumber = getLineNumberOfTheSignature(lineNumberSignature, htmlRawCode);
                for (var k = 0; k < lineNumber.length; k++) {
                    controllerFunctionList.push(new viewEntity.ControllerFunctionInView(directiveCF.signature, directiveCF.acceptedDatatype, directiveAttributeCFValue, lineNumber[k]));
                }

            }
        }
    }

}

function traversDomNodes(node, modelVariableList, theDom) {

    if (node.nodeType == 9) { //DOCUMENT node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversDomNodes(node.childNodes[i], modelVariableList, theDom);
        }
    }
    else if (node.nodeType == 3) { //TEXT node
        var angularExpression = /{{(.*)+}}/g;//angular expression pattern {{xyz}}
        var textNodeData = node.data;
        var tempMatchList;
        while ((tempMatchList = angularExpression.exec(textNodeData)) !== null) {
            var replaced = tempMatchList[0].replace(/{{/g, '').replace(/}}/g, '').trim();
            modelVariableList.push(replaced);

        }
    }
    else if (node.nodeType == 1) { //ELEMENT node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversDomNodes(node.childNodes[i], modelVariableList, theDom);
        }
    }
    return modelVariableList;
}



