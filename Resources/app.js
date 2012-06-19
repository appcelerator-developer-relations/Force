var force = require('force');

force.authorize({
	success: function() {
		force.request({
			type:'GET',
			url:'/sobjects',
			format:'json',
			callback: function(data) {
				alert(JSON.stringify(data));
			}
		});
	},
	error: function() {
		alert('error');
	},
	cancel: function() {
		alert('cancel');
	}
});
