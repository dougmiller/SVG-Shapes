(function () {
    'use strict';

    var objectsList = [];

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
                cb(returnedJSON.data);
            }
        });
    }

    function complete(loopLength, treeContents, cb) {

        if (cb && loopLength === 0) {
            objectsList.push(treeContents);
            cb();
        }
    }

    function parseTree(hash, treeName, cb) {
        var treeContents = {'tree': treeName, 'blobs': []}, loopLength, i, entry;
        var tree = 'https://api.github.com/repos/DougMiller/SVG-Shapes/git/trees/' + hash;

        makeAJAXCall(tree, function (returnedJSON) {
            loopLength = returnedJSON.data.tree.length;
            for (i = 0;  i < returnedJSON.data.tree.length; i += 1) {

                entry = returnedJSON.data.tree[i];

                if (entry.type === 'blob') {
                    if (entry.path.slice(-4) === '.svg') {     // we only want the svg images not the ignore file and README etc
                        parseBlob(entry.url, function (json) {
                            treeContents.blobs.push(json.content);
                            loopLength -= 1;
                            complete(loopLength, treeContents, cb);
                        });
                    } else {
                        loopLength -= 1;  // extra files we don't care about
                    }
                } else if (entry.type === 'tree') {
                    parseTree(entry.sha, entry.path, function () {
                        console.info(objectsList);
                    });
                    loopLength -= 1;
                }
            }
        });
    }

    $(document).ready(function () {
        parseTree('master', 'master', function () {     // master to start at the top and work our way down
            console.info(objectsList);
        });
    });
}());
