module.exports.getRequiredFiles = getRequiredFiles;
var filesystem = require('fs');
var File_Entity = require('./File_Entity.js');

var controllerFileNamesAndPaths = [];
var viewFileNamesAndPaths = [];
var configFileNameAndPath = [];
var directiveFileNameAndPath = [];


function getRequiredFiles(filePathOfTheApplication) {
    findAllFileNameAndPath(filePathOfTheApplication);
    var controllerFiles = readFiles(controllerFileNamesAndPaths);
    var viewFiles = readFiles(viewFileNamesAndPaths);
    var configFile = readFiles(configFileNameAndPath);
    var directiveFile = readFiles(directiveFileNameAndPath);

    return {
        'controllerFiles': controllerFiles,
        'viewFiles': viewFiles,
        'configFile': configFile,
        'directiveFiles': directiveFile
    }
}

function findAllFileNameAndPath(dir) {
    filesystem.readdirSync(dir).forEach(function (file) {
        var stat;
        stat = filesystem.statSync("" + dir + "/" + file);
        if (stat.isDirectory()) {
            return findAllFileNameAndPath("" + dir + "/" + file);
        }
        else if (file.indexOf(".controller.js") > -1) {
            return controllerFileNamesAndPaths.push(new File_Entity.FileNamePath(file, dir + "//" + file));
        } else if (file.indexOf(".view.html") > -1) {
            return viewFileNamesAndPaths.push(new File_Entity.FileNamePath(file, dir + "//" + file));
        } else if (file.indexOf(".config.js") > -1) {
            return configFileNameAndPath.push(new File_Entity.FileNamePath(file, dir + "//" + file));
        } else if (file.indexOf(".directive.js") > -1) {
            return directiveFileNameAndPath.push(new File_Entity.FileNamePath(file, dir + "//" + file));
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
