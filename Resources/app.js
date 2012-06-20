var force = require('force');

force.authorize({
	success: function() {
		//If we're logged in, create a very simple accounts UI
		var ui = require('ui');
		var w = ui.createAppWindow();
		w.open();
	},
	error: function() {
		alert('error');
	},
	cancel: function() {
		alert('cancel');
	}
});
