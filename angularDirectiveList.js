/**
 * Created by Misu Be Imp on 6/9/2016.
 */
//first find all the model variable
//model variables in elements that take them as attribute values

function angularAttributeDirective(signature,acceptedDataType)
{
    this.signature=signature;
    this.acceptedDatatype=acceptedDataType;
};

var enumDataType = {
    UNKNOWN: 'unknown',
    MIX: 'mix', //Used for multiple assigned types to model variables in a controller
    NA: 'na',
    NUMBER: 'number',
    STRING: 'string',
    BOOLEAN: 'boolean'
};

var angularAttributeDirectivesForModelValue=new Array();


angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-bind',enumDataType.NA));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-bind-html',enumDataType.STRING));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-checked',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-disabled',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-hide',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-if',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-open',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-readonly',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-selected',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-show',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-value',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-minlength',enumDataType.NUMBER));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-maxlength',enumDataType.NUMBER));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-pattern',enumDataType.STRING));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-trim',enumDataType.BOOLEAN));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-bind-template',enumDataType.NA));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-href',enumDataType.NA));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-include',enumDataType.NA));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-src',enumDataType.NA));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-srcset',enumDataType.BOOLEAN));
//for ng-pluralize
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('count',enumDataType.NUMBER));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('when',enumDataType.NA));
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('offset',enumDataType.NUMBER));
//fro boolean input type such as radio button
angularAttributeDirectivesForModelValue.push(new angularAttributeDirective('ng-model',enumDataType.BOOLEAN));


var angularAttributeDirectiveForControllerFunctions=new Array();

//Find controller functions in elements that take them as attribute values


angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-blur',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-change',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-click',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-copy',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-cut',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-dlbclick',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-focus',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-keydown',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-keypress',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-keyup',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-mousedown',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-mouseenter',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-mouseleave',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-mousemove',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-mouseover',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-mouseup',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-paste',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-submit',enumDataType.NA));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-checked',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-disabled',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-hide',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-if',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-open',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-readonly',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-selected',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-show',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-value',enumDataType.BOOLEAN));
angularAttributeDirectiveForControllerFunctions.push(new angularAttributeDirective('ng-trim',enumDataType.BOOLEAN));



