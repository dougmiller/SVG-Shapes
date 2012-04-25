(function () {
    'use strict';

    var insertArea;

    function makeAJAXCall(hash, cb) {
        $.ajaxSetup({  
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

    function addSVGToPage(SVGToAdd) {
        var entry, decodedEntry, xmlDoc, importedNode;
        makeAJAXCall(SVGToAdd, function (returnedJSON) {
            entry = decodeURIComponent(escape(atob(returnedJSON.data.content.replace(/\s/g, ''))));  //docment is base64 encoded. We cant use "Accept: 'Application/vnd.github.raw+json'" as it is a jasonp request and we cant change it using that.
            decodedEntry = entry.split('\n').slice(2).join('\n');  //remove the first two elements in the file that prevent them from being added as an actual file.
            xmlDoc = $.parseXML(decodedEntry); // turn the string into an xml fragment

            importedNode = document.importNode(xmlDoc.documentElement, true);
            insertArea.appendChild(importedNode);
        });
    }

    function parseTree(hash) {
        var i, entry, tree = 'https://api.github.com/repos/DougMiller/SVG-Shapes/git/trees/' + hash;

        makeAJAXCall(tree, function (returnedJSON) {
            for (i = 0;  i < returnedJSON.data.tree.length; i += 1) {
                entry = returnedJSON.data.tree[i];

                if (entry.type === 'blob') {
                    if (entry.path.slice(-4) === '.svg') {     // we only want the svg images not the ignore file and README etc
                        addSVGToPage(entry.url);
                    }
                } else if (entry.type === 'tree') {
                    parseTree(entry.sha);
                }
            }
        });
    }

    $(document).ready(function () {
        insertArea = document.getElementById("insertArea");
        parseTree('master');
    });
}());
