/**
 * Created by Misu Be Imp on 6/9/2016.
 */


function View(modelController)
{
    this.viewName=modelController.viewName;
    this.controllerName=modelController.controllerName;
    this.modelIdentifierName=modelController.modelIdentifierName;
    this.modelVaribaleList=new Array();
    this.controllerFunctionList=new Array();
    this.ngRepeatElements=new Array();
    this.customeDirectiveList=new Array();

}