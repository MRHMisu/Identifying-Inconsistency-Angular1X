/**
 * Created by Misu Be Imp on 11/4/2016.
 */

module.exports.getRequiredFiles = getRequiredFiles;


var filesystem = require('fs');
var File_Entity = require('./File_Entity.js');


var controllerRegExpression = /(.*).controller.js/g;
var viewsRegExpression = /(.*).view.js/g;
var configurationExpression = /(.*).config.js/g;

var controllerFileNamesAndPaths = [];
var viewFileNamesAndPaths = [];
var configFileNameAndPath = [];


function getRequiredFiles(filePathOfTheApplication) {
    findAllFileNameAndPath(filePathOfTheApplication);
    var controllerFiles = readFiles(controllerFileNamesAndPaths);
    var viewFiles = readFiles(viewFileNamesAndPaths);
    var configFile = readFiles(configFileNameAndPath);

    return {
        'controllerFiles': controllerFiles,
        'viewFiles': viewFiles,
        'configFile': configFile
    }
}

function findAllFileNameAndPath(dir) {
    filesystem.readdirSync(dir).forEach(function (file) {
        var stat;
        stat = filesystem.statSync("" + dir + "/" + file);
        if (stat.isDirectory()) {
            return findAllFileNameAndPath("" + dir + "/" + file);
        }
        else if (controllerRegExpression.exec(file)) {
            return controllerFileNamesAndPaths.push(new File_Entity.FileNamePath(file, dir + "//" + file));
        } else if (viewsRegExpression.exec(file)) {
            return viewFileNamesAndPaths.push(new File_Entity.FileNamePath(file, dir + "//" + file));
        } else if (configurationExpression.exec(file)) {
            return configFileNameAndPath.push(new File_Entity.FileNamePath(file, dir + "//" + file));
        }
    });
};


function readFiles(fileList) {
    var fileWithContent = [];
    for (var i = 0; i < fileList.length; i++) {
        var data = filesystem.readFileSync(fileList[i].path);
        fileWithContent.push(new File_Entity.FileNamePathContent(fileList[i].name, fileList[i].path, data.toString()));
    }
    return fileWithContent;
}



