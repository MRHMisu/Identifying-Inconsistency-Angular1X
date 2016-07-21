/**
 * Created by Misu Be Imp on 6/10/2016.
 */


function getLoggerCode() {


    code = document.getElementById('textEditor').value;
    var customizeCode = addLogger(code);
    document.getElementById('display').value = customizeCode;
}

function addLogger(code) {
    var ast = esprima.parse(code);
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {

                var uid = generateUUID();
                addAdditionalStartingCode(node, uid);
                addAdditionalExitingCode(node, uid)
            }
        }/*,
         leave: function (node, parent) {
         if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {
         addAdditionalExitingCode(node);
         }
         }*/
    });
    return escodegen.generate(ast);
}

function addAdditionalStartingCode(node, uid) {

    var functionName = node.id ? node.id.name : "<anonymous functions>";
    var enterIntoFunctionCode = "console.log('Entering to->" + functionName + "()')";
    var enterIntoFunctionNode = esprima.parse(enterIntoFunctionCode).body;
    var startingTimeCode = "var " + uid + "_start = new Date().getTime();";
    var staringTimeNode = esprima.parse(startingTimeCode).body;
    var additionStartingNode = enterIntoFunctionNode.concat(staringTimeNode);
    node.body.body = additionStartingNode.concat(node.body.body);

}
function addAdditionalExitingCode(node, uid) {

    var functionName = node.id ? node.id.name : "<anonymous functions>";
    var endingTimeCode = "var " + uid + "_end = new Date().getTime();";
    var endingTimeNode = esprima.parse(endingTimeCode).body;
    var calculatingExecutionTimeCode = "console.log('--Executing within " + "(" + uid + "_end" + " - " + uid + "_start)');"
    var calculatingExecutionTimeNode = esprima.parse(calculatingExecutionTimeCode).body;
    var exitFromFunctionCode = "console.log('----Exiting from->" + functionName + "()')";
    var exitFromFunctionNode = esprima.parse(exitFromFunctionCode).body;
    var additionalEndingNode = endingTimeNode.concat(calculatingExecutionTimeNode).concat(exitFromFunctionNode);
    var length = node.body.body.length;
    if (node.body.body[length - 1].type == "ReturnStatement") {
        node.body.body.splice([length - 1], 0, additionalEndingNode[0], additionalEndingNode[1], additionalEndingNode[2]);
    } else {
        node.body.body = node.body.body.concat(additionalEndingNode);
    }

}


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};


