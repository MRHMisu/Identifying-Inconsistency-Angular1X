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
    this.properties = properties;
    this.dataType = dataType;
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

