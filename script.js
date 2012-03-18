(function () {
    'use strict';

    var objectsList = [];
    var isParsing = 0;

    function makeAJAXCall(hash, cb) {
        $.ajaxSetup({
            accept: 'application/vnd.github.raw',
            dataType: 'jsonp'
        });

        $.ajax({
            url: hash,
            success: function (json) {
                if (cb) {
                    cb(json);
                }
            },
            error: function (error) {
                console.error(error);
                throw error;
            }
        });
    }

    function parseBlob(hash, cb) {
        makeAJAXCall(hash, function (returnedJSON) {  // no loop as only one entry
            if (cb) {
                cb(returnedJSON.data.content);
            }
        });
    }

    function complete(loopLength, treeContents, cb) {

        if (cb && loopLength === 0) {
            objectsList.push(treeContents);
            isParsing -= 1;
            if (!isParsing){
                console.info(objectsList);
            }
            cb();
        }
    }

    function parseTree(hash, treeName, cb) {
        var treeContents = {'tree': treeName, 'blobs': []}, loopLength, i, entry;
        var tree = 'https://api.github.com/repos/DougMiller/SVG-Shapes/git/trees/' + hash;

        makeAJAXCall(tree, function (returnedJSON) {
            loopLength = returnedJSON.data.tree.length;
            isParsing += 1;
            for (i = 0;  i < returnedJSON.data.tree.length; i += 1) {

                entry = returnedJSON.data.tree[i];

                if (entry.type === 'blob') {
                    if (entry.path.slice(-4) === '.svg') {     // we only want the svg images not the ignore file and README etc
                        parseBlob(entry.url, function (parsedBlob) {
                            treeContents.blobs.push((entry.path, parsedBlob));
                            loopLength -= 1;
                            complete(loopLength, treeContents, cb);
                        });
                    } else {
                        loopLength -= 1;  // extra files we don't care about
                    }
                } else if (entry.type === 'tree') {
                    parseTree(entry.sha, entry.path, function () {

                    });
                    loopLength -= 1;
                }
            }
        });
    }

    $(document).ready(function () {
        parseTree('master', 'master', function () {     // master to start at the top and work our way down
            if (!isParsing){
                console.info(objectsList);
            }
        });
    });
}());
