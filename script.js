function getTree(hash) {
    var pathToTree, returnedJSON;
    pathToTree = 'https://api.github.com/repos/dougmiller/SVG-Shapes/git/trees/' + hash;
    $.ajax({
        accepts: 'application/vnd.github-blob.raw',
        dataType: 'jsonp',
        url: pathToTree,
        success: function (json) {
            console.debug(json);
            returnedJSON = json;
            console.debug(returnedJSON);
        },
        error: function (error) {
            console.debug(error);
        }
    });
    return returnedJSON;
}

function parseTree(hash) {
    var objectedJSON, objectList = [], i;
    objectedJSON = getTree(hash, function () {
        console.debug(objectedJSON);
        for (i = 0;  i < objectedJSON.data.tree.length; i += 1) {
            if (i.type === 'blob') {
                if (i.type.slice(-4) === '.svg') {     // we only want the svg images not the ignore file and README etc
                    objectList.append(i.content);
                }
            } else if (i.type === 'tree') {
                    objectList.append(parseTree(getTree(i.sha)));
            }
        }

    });
    return objectList;
}

$(document).ready(function () {
    var objects = parseTree('master', function () {
        console.debug(objects);
    });
});
