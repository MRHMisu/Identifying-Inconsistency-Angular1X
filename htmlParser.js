/**
 * Created by Misu Be Imp on 6/9/2016.
 */

var textInEditor;
function getHTMLCode() {

    //parse the html into DOM
    textInEditor = document.getElementById('textEditor').value;
    var htmlParser = new DOMParser();
    var parsedDOM = htmlParser.parseFromString(textInEditor, "text/html");
    //end parsing

    //list of views in a single html file
    var viewList = new Array();
    //modelController contains controller name and modelIdentifier name
    var modelViewController = new ModelViewController();
    //find the all the controllers from the DOM
    var modelControllerElements = parsedDOM.querySelectorAll("[ng-controller]");

    //parsing every controllers and generate a separate view for every controllers
    for (var k = 0; k < modelControllerElements.length; k++) {
        if (modelControllerElements[k] != null) {
            modelViewController.controllerName = modelControllerElements[k].getAttribute("ng-controller");
            if (modelViewController.controllerName.indexOf('as') > -1) {
                var parsedControllerAsExpression = modelViewController.controllerName.split(" ");
                modelViewController.controllerName = parsedControllerAsExpression[0];
                modelViewController.modelIdentifierName = parsedControllerAsExpression[2];
            }
            modelViewController.viewName = modelViewController.controllerName + "_CorrespondingView";
        }
        //create a new view
        var correspondingControllerView = new View(modelViewController);


        //find all model variables from view as attribute
        for (var i = 0; i < angularAttributeDirectivesForModelValue.length; i++) {
            var directive = angularAttributeDirectivesForModelValue[i];
            //var element=parsedDOM.querySelector('['+directive.signature+']');
            var elements = modelControllerElements[k].querySelectorAll('[' + directive.signature + ']');

            if (elements != null && elements.length > 0) {
                for (var j = 0; j < elements.length; j++) {
                    var directiveAttributeModelValue = elements[j].getAttribute(directive.signature);
                    correspondingControllerView.modelVaribaleList.push(new ModelVariableInView(directive.signature, directiveAttributeModelValue));

                }
            }
        }

        //find all controller functions from the view as attribute
        for (var i = 0; i < angularAttributeDirectiveForControllerFunctions.length; i++) {
            var directiveControllerFunction = angularAttributeDirectiveForControllerFunctions[i];
            //var element=parsedDOM.querySelector('['+directive.signature+']');
            var elements = modelControllerElements[k].querySelectorAll('[' + directiveControllerFunction.signature + ']');

            if (elements != null && elements.length > 0) {
                for (var j = 0; j < elements.length; j++) {
                    var directiveAttributeControllerFunctionValue = elements[j].getAttribute(directiveControllerFunction.signature);

                    correspondingControllerView.controllerFunctionList.push(new ControllerFunction(directiveControllerFunction.signature, directiveAttributeControllerFunctionValue));

                }
            }
        }

        //find all angular expression from each ng-repeat

        var allNgRepeatElement = modelControllerElements[k].querySelectorAll("[ng-repeat]");
        for (var i = 0; i < allNgRepeatElement.length; i++) {
            element = allNgRepeatElement[i].getAttribute('ng-repeat');
            var ngRepeatExpression = element.split("in");
            var alice = ngRepeatExpression[0].trim();
            var modelVariable = ngRepeatExpression[1].trim();
            var ngRepeatElement = traversNgRepeat(allNgRepeatElement[i], new Array(), allNgRepeatElement[i]);
            for (var l = 0; l < ngRepeatElement.length; l++) {
                //replace
                var replacedElement = ngRepeatElement[l].replace(alice, modelVariable);
                // var replacedAngularExpression = replacedElement.replace(/{{/g, '').replace(/}}/g, '').trim();
                correspondingControllerView.ngRepeatElements.push(new ModelVariableInView('ng-repeat-element', replacedElement));
            }

        }

        var allAngularExpression=traversNgRepeat(modelControllerElements[k], new Array(), modelControllerElements[k]);

        viewList.push(correspondingControllerView);
    }
}


function traversControllerDomForFindingAngularExpression(node, correspondingControllerView, theDom) {
    if (node.nodeType == 9) { //DOCUMENT node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversControllerDomForFindingAngularExpression(node.childNodes[i], correspondingControllerView, theDom);
        }
    }
    else if (node.nodeType == 3) { //TEXT node
        var angularExpression = /{{(.*)+}}/g;//angular expression pattern {{xyz}}
        var textNodeData = node.data;
        var tempMatchList;
        while ((tempMatchList = angularExpression.exec(textNodeData)) !== null) {
            var replaced = tempMatchList[0].replace(/{{/g, '').replace(/}}/g, '').trim();
            correspondingControllerView.modelVaribaleList.push(new ModelVariableInView('angularExpression', replaced));

        }
    }
    else if (node.nodeType == 1) { //ELEMENT node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversControllerDomForFindingAngularExpression(node.childNodes[i], correspondingControllerView, theDom);
        }
    }
}

function traversNgRepeat(node, modelVariableList, theDom) {

    if (node.nodeType == 9) { //DOCUMENT node
        for (var i = 0; i < node.childNodes.length; i++) {
            traversNgRepeat(node.childNodes[i], modelVariableList, theDom);
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
            traversNgRepeat(node.childNodes[i], modelVariableList, theDom);
        }
    }
    return modelVariableList;
}

