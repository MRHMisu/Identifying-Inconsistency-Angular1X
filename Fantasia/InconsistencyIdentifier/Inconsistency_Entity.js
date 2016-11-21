
module.exports.inconsistency = inconsistency;
var colors = require('colors');

function inconsistency(type, occurence, whereOccured) {
    this.type = type,
        this.occurence = occurence,
        this.whereOccured = whereOccured
    

}

inconsistency.prototype.print=function(no)
{
    console.log(((no+1)+":").blue.bold+this.type.green.bold+" occure between "+this.occurence.yellow.bold);
    console.log(this.whereOccured.red.bold+'\n');
}
