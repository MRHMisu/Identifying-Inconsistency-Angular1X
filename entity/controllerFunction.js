/**
 * Created by Misu Be Imp on 6/10/2016.
 */

function ControllerFunction(usedDirectiveName,controllerFunctionName)
{
    this.usedDirectiveName=usedDirectiveName;
    this.controllerFunctionName=controllerFunctionName;

}

function ControllerFunction(controllerFunctionName,parameters,returnType)
{
    this.controllerFunctionName=controllerFunctionName;
    this.parameters=parameters;
    this.returnType=returnType;
}