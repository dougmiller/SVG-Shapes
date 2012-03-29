(function () {
    'use strict';

    var objectsList = [], isParsing = 0, insertArea = $('insertArea');
    var svger = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="400" height="400"><style type="text/css">#powerGlyph:hover {filter: url(#distanceBlurClose);}</style><defs><path id="roundOff" d="M250,80 a150,150 1 1 1 -100,0"/><line id="straightOn" x1="202.5" y1="20" x2="202.5" y2="270"/><filter id="distanceBlurClose"><feGaussianBlur in="SourceGraphic" stdDeviation="1"/></filter></defs><g id="powerGlyph"><use xlink:href="#roundOff" stroke-width="15" stroke="gray" style="fill:none; stroke-linecap: round; filter:url(#distanceBlurClose);"/><use xlink:href="#straightOn" stroke-width="15" stroke="gray" style="fill:none; stroke-linecap: round; filter:url(#distanceBlurClose);"/></g></svg>';


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
            document.body.appendChild(importedNode);
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
