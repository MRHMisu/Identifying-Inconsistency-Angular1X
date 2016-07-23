/**
 * Created by Misu Be Imp on 6/10/2016.
 */


function ModelVariableInView(usedDirectiveName, modelVariableName) {
    this.usedDirectiveName = usedDirectiveName;
    this.modelVariableName = modelVariableName;

}

function singleVariableInController(name, value, dataType) {
    this.name = name;
    this.value = value;
    this.dataType = dataType;

}

function objectVariableInController(name, properties, dataType) {
    this.name = name;
    this.properties = convertObjectProperties(name,properties);
    this.dataType = dataType;
}



function convertObjectProperties(objectName,properties)
{
    var objectPropertySerelization=new Array();
    for(var i=0; i<properties.length;i++)
    {
        var name=objectName+"."+properties[i].name;
        var dataType=properties[i].dataType;
        var value=properties[i].value;
        objectPropertySerelization(new Property(name,dataType,value));
    }

}





function arrayVariableInController(name, elements) {
    this.name = name;
    this.elements = elements;
}

function property(name, value, type) {
    this.name = name;
    this.value = value;
    this.type = type;
}
function element(value, type) {
    this.value = value;
    this.type = type;

}

