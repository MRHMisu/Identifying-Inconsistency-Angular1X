/**
 * Code Parser
 * 
 * This module contains helper methods for parsing JS and HTML code in the
 * editors
 */

/**
 * Returns the AST (in Esprima JSON format) of the corresponding
 * JS code in the given editor
 * @param {Object} index
 * 		Index number of the pertinent editor (in the editors array)
 * @returns
 * 		The AST of the JS code (null if the editor instance is in
 * 		HTML mode, or if any exceptions take place) wrapped in an
 * 		object that also contains the filename (or, unique ID)
 */
function retrieveAST(index) {
	var parsedContent = esprima.parse(editors[index].instance.getValue().toString(), {loc: true});
	
	//alert(JSON.stringify(parsedContent, adjustRegexLiteral, 4));
	
	var filename = editors[index].name;
	
	//alert(filename);
	
	return {filename: filename, ast: parsedContent};
}

/**
 * Returns the DOM of the corresponding HTML code in the
 * given editor
 * @param {Object} index
 * 		Index number of the pertinent editor (in the editors array)
 * @returns
 * 		The DOM of the HTML code (null if the editor instance is in
 * 		JS mode, or if any exceptions take place) wrapped in an
 * 		object that also contains the filename (or, unique ID)
 */
function retrieveDOM(index) {
	//TODO: Determine if we can get line numbers from document object
	var htmlStr = editors[index].instance.getValue().toString();
	var parser = new DOMParser();
	var parsedDom = parser.parseFromString(htmlStr, "text/html");
	
	//alert(parsedDom);
	//alert(parsedDom.querySelector("[id='sample']").tagName);
	//alert(parsedDom.getElementsByTagName("div").length);
	
	var filename = editors[index].name;
	
	//alert(filename);
	
	return {filename: filename, dom: parsedDom};
}
