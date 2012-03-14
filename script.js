function makeAJAXCall(hash, cb) {
    var returnedJSON, cb = cb, hash = hash;
    $.ajax({
        accepts: 'application/vnd.github-blob.raw',
        dataType: 'jsonp',
        url: hash,
        success: function (json) {
            console.info(json);
            returnedJSON = json;
			
			// Time for callback to be executed
            if (cb) {
				cb(json);
			}
        },
        error: function (error) {
            console.error(error);
            // an error happened, check it out.
            throw error;
        }
    });
    return returnedJSON;
}

function parseBlob(hash) {
    var objectedJSON, objectList = [], i;
    objectedJSON = makeAJAXCall(hash, function (objectedJSON) {  // no loop as only one entry
        objectList.push(objectedJSON.content);
    });
    return objectList;
}

function walkTree(hash) {
    var objectedJSON, objectList = [], i, entry;
    var hash = 'https://api.github.com/repos/DougMiller/SVG-Shapes/git/trees/' + hash;
    objectedJSON = makeAJAXCall(hash, function (objectedJSON) {
        for (i = 0;  i < objectedJSON.data.tree.length; i += 1) {
            entry = objectedJSON.data.tree[i];
            console.debug(entry);
            if (entry.type === 'blob') {
                if (entry.path.slice(-4) === '.svg') {     // we only want the svg images not the ignore file and README etc
                    console.info(entry.path)
                    objectList.push(parseBlob(entry.url));
                }
            } else if (entry.type === 'tree') {
                objectList.push(walkTree(entry.sha));
            }
        }
    
    });
    console.info(objectList);
    return objectList;
}

$(document).ready(function () {
    var objects = walkTree('master', function () {     // master to start at the top and work our way down
        console.info(objects);
    });
});

