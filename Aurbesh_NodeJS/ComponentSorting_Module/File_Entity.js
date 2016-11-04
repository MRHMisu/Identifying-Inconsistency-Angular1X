/**
 * Created by Misu Be Imp on 11/4/2016.
 */


module.exports.FileNamePath=FileNamePath;
module.exports.FileNamePathContent=FileNamePathContent;

function FileNamePath(name, path) {
    this.name = name,
        this.path = path

}

function FileNamePathContent(name, path, content) {
    this.name = name,
        this.path = path,
        this.content = content

}