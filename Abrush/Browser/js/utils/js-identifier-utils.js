/**
 * Determines if a string is a valid JS identifier. Dot notation is allowed
 * 
 * Assumes the identifier contains no unicode characters
 * 
 * @param {Object} str
 */
function isIdentifier(str) {
	var ids = str.split(".");

	for (var i = 0; i < ids.length; i++) {
		var regex = /\b[a-zA-Z_$][0-9a-zA-Z_$]*\b/g;
		var comparisonResult = regex.exec(ids[i]);
		if (comparisonResult == null) {
			return false;
		}
		else if (comparisonResult[0] != ids[i]) { //If the regex has a match in ids[i], check if this matches the *entire* string
			return false;
		}
	}
	
	return true;
}
