var force = require('force');

force.authorize({
	success: function() {
		alert('authorized')
	},
	error: function() {
		alert('error');
	},
	cancel: function() {
		alert('cancel');
	}
});
