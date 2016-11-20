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