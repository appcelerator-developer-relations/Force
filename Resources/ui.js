var force = require('force');

function DetailWindow(accountId, name, onchange) {
	var w = Ti.UI.createWindow({
		title:(accountId) ? 'Update Account' : 'New Account',
		backgroundColor:'#fff',
		navBarHidden:false,
		modal:!accountId,
		layout:'vertical',
		backButtonTitle:'Back'
	});
	
	w.add(Ti.UI.createLabel({
		text:'Account Name',
		top:10,
		font:{
			fontSize:18,
			fontWeight:'bold'
		}
	}));
	
	var nameField = Ti.UI.createTextField({
		height:44,
		top:10,
		left:10,
		right:10,
		value:name,
		keyboardType:Ti.UI.KEYBOARD_DEFAULT,
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	w.add(nameField);
	
	var submit = Ti.UI.createButton({
		top:10,
		title:(accountId) ? 'Update' : 'Create'
	});
	w.add(submit);
	
	if (Ti.Platform.osname !== 'android' && !accountId) {		
		var b = Ti.UI.createButton({
			title:'Cancel',
			style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
		});
		w.setRightNavButton(b);
		b.addEventListener('click', function() {
			w.close();
		});
	}
	
	//Save the account, or update, as appropriate
	submit.addEventListener('click', function() {
		var suffix = (accountId) ? '/'+accountId+'/?_HttpMethod=PATCH' : '/';
		force.request({
			type:'POST',
			url:'/sobjects/Account'+suffix,
			data: {
				Name:nameField.value
			},
			callback: function(data) {
				onchange();
			},
			onerror: function() {
				alert('durp');
			}
		});
	});
	
	return w;
}

//very simple UI
exports.createAppWindow = function() {
	var win = Ti.UI.createWindow({
		title:'Salesforce Accounts',
		exitOnClose:true,
		backgroundColor:'#fff',
		navBarHidden:false
	});
	
	function doAdd() {
		var detail = new DetailWindow(null,null,function() {
			detail.close();
			list();
		});
		detail.open();
	}
	
	//Create platform-specific UI for adding an account
	if (Ti.Platform.osname !== 'android') {
		//on iPhone create a NavigationController-style UI
		var containerWin = Ti.UI.createWindow();
		var navGroup = Ti.UI.iPhone.createNavigationGroup({
			window:win
		});
		containerWin.add(navGroup);
		
		//create add button for the navigation bar
		var addButton = Ti.UI.createButton({
			systemButton:Ti.UI.iPhone.SystemButton.ADD
		});
		win.setRightNavButton(addButton);
		addButton.addEventListener('click', doAdd);
	}
	else {
		win.activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var m1 = menu.add({ title : 'Add Account' });
			m1.setIcon(Ti.Android.R.drawable.ic_menu_add);
			m1.addEventListener('click', doAdd);
		};
	}
	
	//Create a table to hold Account listings
	var table = Ti.UI.createTableView({
		data:[{title:'Loading...'}]
	});
	win.add(table);
	
	table.addEventListener('click', function(e) {
		var deets = new DetailWindow(e.rowData.accountId, e.rowData.title, function() {
			if (Ti.Platform.osname !== 'android') {
				navGroup.close(deets);
			}
			else {
				deets.close();
			}
			list();
		});
		
		if (Ti.Platform.osname !== 'android') {
			navGroup.open(deets);
		}
		else {
			deets.open();
		}
	});
	
	//fetch new salesforce account data
	function list() {
		table.setData([{title:'Loading...'}]);
		force.request({
			type:'GET',
			url:'/query/?q='+Ti.Network.encodeURIComponent('SELECT name from Account'), //inlining SOQL query
			callback: function(data) {
				var rows = [];
				
				for (var i = 0, l = data.records.length; i<l; i++) {
					var rec = data.records[i];
					Ti.API.info(JSON.stringify(rec));
					rows.push({
						title:rec.Name,
						accountId:rec.attributes.url.split('Account/')[1],
						hasChild:true
					});
				}
				
				table.setData(rows);
			}
		});
	}
	
	//initialize the list table
	list();
	
	return containerWin || win;
};
