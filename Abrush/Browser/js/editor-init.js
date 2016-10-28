//Array containing all the editors we will create
var editors = [];
    
$(document).ready(function() {
    //Initialize tabs
    $('#tabs').tabs();
    
    //Clear all controls
    clearControls();
    
    //Create default editor
    createNewEditor();
    
    //Initialize button listener
    $('#add-tab').on('click', function() {
    	//Make sure the name field isn't empty
    	if (document.getElementById("name-input").value == "" || document.getElementById("name-input").value == null) {
    		alert("Make sure you give the new editor a name!");
    		return;
    	}
    	createNewEditor();
    	clearControls();
    });
    
	$('#tabs').on('click', '.close', function() {
		if (editors.length == 1) {
			alert("Can't close when there's only one editor open");
			return;
		}
		console.log('close a tab and destroy the ace editor instance');
		
		console.log($(this).parent());
		
		var tabUniqueId = $(this).parent().attr('data-tab-id');
		
		console.log(tabUniqueId);        
		
		var resultArray = $.grep(editors, function(n,i){
		    return n.id == tabUniqueId;
		}, false);
		
		var editor = resultArray[0].instance;
		
		//console.log(resultArray);
		
		//Destroy the editor instance
		editor.destroy();
		
		//Remove the panel and panel nav dom
		$('#tabs').find('#panel_nav_' + tabUniqueId).remove();
		$('#tabs').find('#panel_' + tabUniqueId).remove();
		
		//Activate the first tab
		var tabsElement = $('#tabs');
		tabsElement.tabs('refresh');
		tabsElement.tabs('option', 'active', 0);
		
		//Remove editor from list of editors
		for (var i = 0; i < editors.length; i++) {
			if (editors[i].id == resultArray[0].id) {
				editors.splice(i, 1);
			}
		}
	});
    
    //Assign event handler for "Find Inconsistencies" button. This is the main analyzer code
    $('#analyze-button').on('click', function() {
    	//Time measurement
    	var start = new Date().getTime();
    	
    	//Reset
    	models = [];
    	views = [];
    	controllers = [];
    	mvc_groups = [];
    	routers = [];
    	
    	//Clear annotations
		//TODO: Find some way to preserve non-Aurebesh annotations
		for (var i = 0; i < editors.length; i++) {
			var editor = editors[i].instance;
			editor.getSession().clearAnnotations();
		}
    	
    	//Which framework is being used?
    	var fw_type = selectedFrameworkType();
    	
    	//Loop through all editors. Retrieve and parse the code in each one to find the models
    	//views, and controllers
    	for (var i = 0; i < editors.length; i++) {
    		var mode = editors[i].instance.getSession().getMode().$id;
    		if (mode == "ace/mode/javascript") {
    			var astObj = retrieveAST(i);
    			extractMVC(astObj, null, i, fw_type);
    		}
    		else if (mode == "ace/mode/html") {
    			var domObj = retrieveDOM(i);
    			extractMVC(null, domObj, i, fw_type);
    		}
    	}
    	
    	//Now, find all the (model, view, controller) groupings
    	findMVCGroupings(fw_type);
    	
    	//For each grouping, determine the inconsistencies
    	for (var i = 0; i < mvc_groups.length; i++) {
    		findIdentifierInconsistencies(mvc_groups[i]);
    	}
    	
    	//Time measurement
    	var end = new Date().getTime();
    	var time = end - start;
    	//alert("Execution time: " + time);
    });
});

function createNewEditor() {
	console.log('add a tab with an ace editor instance');
	
	var tabsElement = $('#tabs');
	var tabsUlElement = tabsElement.find('ul');
	
	//The panel id is a timestamp plus a random number from 0 to 10000
	var tabUniqueId = (new Date()).getTime() + Math.floor(Math.random()*10000);

	//Find the name and the editor type
	var name = "index.html"; //default
	var editorType = "javascript"; //default
	var nameElem = document.getElementById("name-input");
	var editorTypeElem = document.getElementById("editor-type-input");
	if (nameElem && nameElem.value != null && nameElem.value != "") {
		name = nameElem.value;
	}
	if (editorTypeElem) {
		editorType = editorTypeElem.value;
	}
	
	//Create a navigation bar item for the new panel
	var newTabNavElement = $('<li id="panel_nav_' + tabUniqueId + '"><a href="#panel_' + tabUniqueId + '">' + name + '</a></li>');
	
	//Add the new nav item to the DOM
	tabsUlElement.append(newTabNavElement);
	
	//Create a new panel DOM
	var newTabPanelElement = $('<div id="panel_' + tabUniqueId + '" data-tab-id="' + tabUniqueId + '"></div>');
	
	tabsElement.append(newTabPanelElement);
	
	//Refresh the tabs widget
	tabsElement.tabs('refresh');
	
	var tabIndex = $('#tabs ul li').index($('#panel_nav_' + tabUniqueId));
	
	console.log('tabIndex: ' + tabIndex);
	
	//Activate the new panel
	tabsElement.tabs('option', 'active', tabIndex);
	
	//Create the editor dom
	var newEditorElement = $('<div id="editor_' + tabUniqueId + '"></div>');
	
	newTabPanelElement.append(newEditorElement);
	
	//Initialize the editor in the tab
	var editor = ace.edit('editor_' + tabUniqueId);
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/" + editorType);
	
	//Set the size of the panel
	newTabPanelElement.width('500');
	newTabPanelElement.height('550');
	
	//Set the size of the editor
	newEditorElement.width('500');
	newEditorElement.height('500');
	
	//Resize the editor
	editor.resize();
	
	editors.push({ id: tabUniqueId, instance: editor, name: name });
	
	//Add an editor/panel close button to the panel dom
	var closeButton = $('<button class="close">Close</button>');
	    
	newTabPanelElement.append(closeButton);
}

function clearControls() {
	document.getElementById("name-input").value = "";
	document.getElementById("editor-type-input").selectedIndex = 0;
}

function selectedFrameworkType() {
	var frameworkSelection = $("#framework-type-input")[0].value;
	if (frameworkSelection == "angular") {
		return FrameworkType.ANGULAR;
	}
	else if (frameworkSelection == "backbone") {
		return FrameworkType.BACKBONE;
	}
	else if (frameworkSelection == "ember") {
		return FrameworkType.EMBER;
	}
	else { //Default
		return FrameworkType.ANGULAR;
	}
}
