(function () {
    'use strict';

    var objectsList = [], isParsing = 0, insertArea = $('insertArea');

    function makeAJAXCall(hash, cb) {
        $.ajaxSetup({
            Accept: 'Application/vnd.github.raw+json',
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

    function addSVGToPage(SVGToAdd) {
        var entry, decodedEntry, xmlDoc, importedNode;
        makeAJAXCall(SVGToAdd, function (returnedJSON) {
            var svgElement;
            entry = decodeURIComponent(escape(atob(returnedJSON.data.content.replace(/\s/g, ''))));
            decodedEntry = entry.split('\n').slice(2).join('\n');  //remove the first two elements in the file that prevent them from being added as an actual file.
            xmlDoc = $.parseXML(decodedEntry); // turn the string into an xml fragment

            importedNode = document.importNode(xmlDoc.documentElement, true);
            $(insertArea).appendChild(importedNode);
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
        parseTree('master');
    });
}());
