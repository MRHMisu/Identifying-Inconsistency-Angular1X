getDirectiveTag("appVersionName")


function getDirectiveTag(directiveName) {
    var tag = directiveName.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
        return str.toLowerCase();
    });
    tag=tag.split(' ').join('-').toLowerCase();
    console.log(tag);
    return tag;
}

