/**
 * MVC EXTRACTOR
 * 
 * This module infers what models, views, and controllers are in the web app
 * based on a static analysis of the code
 */

/**
 * Finds the models, views, and controllers in a given AST or a given
 * DOM by parsing the AST or DOM. This method modifies the models, views,
 * and controllers objects. Note that either astObj is null, or domObj is
 * null (but noth both). If both objects are not null, only the astObj is
 * considered
 * @param {Object} astObj
 * 			The AST object containing an AST and the filename of the code
 * 			from which this AST was generated
 * @param {Object} domObj
 * 			The DOM object containing a DOM and the filename of the code
 * 			from which this DOM was generated
 * @param editorInstance
 * 			The index of the editor instance
 * @param framework
 * 			The framework type
 */
function extractMVC(astObj, domObj, editorInstance, framework) {
	if (astObj != null) {
		extractMVCFromAst(astObj, editorInstance, framework);
	}
	else if (domObj != null) {
		extractMVCFromDom(domObj, editorInstance, framework);
	}
}

/**
 * Extract MVC from the AST based on the framework type
 * @param {Object} astObj
 * 			The AST object containing an AST and the filename of the code
 * 			from which this AST was generated
 * @param editorInstance
 * 			The index of the editor instance
 * @param framework
 * 			The framework type
 */
function extractMVCFromAst(astObj, editorInstance, framework) {
	if (framework == FrameworkType.ANGULAR) {
		extractMVCFromAst_Angular(astObj, editorInstance);
	}
	else if (framework == FrameworkType.BACKBONE) {
		extractMVCFromAst_Backbone(astObj, editorInstance);
	}
	else if (framework == FrameworkType.EMBER) {
		extractMVCFromAst_Ember(astObj, editorInstance);
	}
	else { //Default
		extractMVCFromAst_Angular(astObj, editorInstance);
	}
}

/**
 * Extract MVC from the DOM based on the framework type
 * @param {Object} domObj
 * 			The DOM object containing a DOM and the filename of the code
 * 			from which this DOM was generated
 * @param editorInstance
 * 			The index of the editor instance
 * @param framework
 * 			The framework type
 */
function extractMVCFromDom(astObj, editorInstance, framework) {
	if (framework == FrameworkType.ANGULAR) {
		extractMVCFromDom_Angular(astObj, editorInstance);
	}
	else if (framework == FrameworkType.BACKBONE) {
		extractMVCFromDom_Backbone(astObj, editorInstance);
	}
	else if (framework == FrameworkType.EMBER) {
		extractMVCFromDom_Ember(astObj, editorInstance);
	}
	else { //Default
		extractMVCFromDom_Angular(astObj, editorInstance);
	}
}

/**
 * Finds the line number of the given node in the HTML code
 * @param {Object} node
 * 			The node
 * @param {Object} theDom
 * 			The DOM where the node is located
 * @param {Object} editorInstance
 * 			The index of the editor instance
 * @returns
 * 			The line number of the given node in the HTML code
 */
function getLineNumber(node, theDom, editorInstance) {
	var clean_lines = getCleanLines(editorInstance);
	var tag = node.tagName;
	var all_tags = $(tag, theDom);
	var index = all_tags.index(node) + 1;
	
	var num_tags_found = 0;
	for (var row = 0; row < clean_lines.length; row++) {
		var re = new RegExp('<' + tag + '[> ]', 'gi');
		var matches = clean_lines[row].match(re);
		if (matches && matches.length) {
			num_tags_found += matches.length;
			if (num_tags_found >= index) {
				return row + 1; //row only gives the *index* number in clean_lines
			}
		}
	}
}

/**
 * Splits the lines in the source code
 * @param {Object} editorInstance
 * 			The index of the editor instance from which the source code is found
 */
function getCleanLines(editorInstance) {
	var raw_source = editors[editorInstance].instance.getValue().toString();
    var lines = raw_source.split(/\r?\n/);

    // now sanitize the raw html so you don't get false hits in code or comments
    var inside = false;
    var tag = '';
    var closing = {
        xmp: '<\\/\\s*xmp\\s*>',
        script: '<\\/\\s*script\\s*>',
        '!--': '-->'
    };
    var clean_lines = $.map(lines, function(line) {
        if (inside && line.match(closing[tag])) {
            var re = new RegExp('.*(' + closing[tag] + ')', 'i');
            line = line.replace(re, "$1");
            inside = false;
        } else if (inside) {
            line = '';
        }

        if (line.match(/<(script|!--)/)) {
            tag = RegExp.$1;
            line = line.replace(/<(script|xmp|!--)[^>]*.*(<(\/(script|xmp)|--)?>)/i, "<$1>$2");
            var re = new RegExp(closing[tag], 'i');
            inside = ! (re).test(line);
        }

        // remove quoted strings, because they might have false positive tag matches (like '<span>')
        line = line.replace(/(["'])(?:[^\\\1]|\\.)*\1/, '$1unsafe_string$1');

        return line;
    });
    
    return clean_lines;
}

/**
 * Simple function that looks for the first line in the editor instance
 * that contains the given text
 */
function getLineNumberOfText(text, editorInstance) {
	var raw_source = editors[editorInstance].instance.getValue().toString();
	var lines = raw_source.split(/\r?\n/);
	
	for (var i = 0; i < lines.length; i++) {
		var pattern = new RegExp("{{\\s*" + text + "\\s*}}");
		if (pattern.test(lines[i])) {
			return i + 1;
		}
	}
	
	return -1;
}
