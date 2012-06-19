//Global Configuration
var API_URL = '/services/data/v25.0'; //Currently hard-coded to Summer 2012 release
var CONSUMER_KEY = Ti.App.Properties.getString('force.consumer.key');
var CONSUMER_SECRET = Ti.App.Properties.getString('force.consumer.secret');
var REDIRECT_URI = 'https://login.salesforce.com/services/oauth2/success';
var LOGIN_URL = 'https://login.salesforce.com/services/oauth2/authorize?display=touch&response_type=token'
	+ '&client_id=' + Ti.Network.encodeURIComponent(CONSUMER_KEY)
	+ '&redirect_uri=' + REDIRECT_URI;

//Login Session State
var INSTANCE_URL = Ti.App.Properties.getString('force.instanceURL');
var ACCESS_TOKEN = Ti.App.Properties.getString('force.accessToken');
var REFRESH_TOKEN = Ti.App.Properties.getString('force.refreshToken');

//internal helpers
function info(str) {
	Ti.API.info('[Force.com] '+str);
}

//Authorize a Salesforce.com User Account
exports.authorize = function(callbacks) {
	
	//Authorization Window UI Constructor
	function AuthorizationWindow() {
		var self = Ti.UI.createWindow({
			modal:true,
			title:'Force.com Login'
		});
		
		var webView = Ti.UI.createWebView({
			height:Ti.UI.FILL,
			widht:Ti.UI.FILL,
			url:LOGIN_URL
		});
		self.add(webView);
		
		//cancel login action
		function cancel() {
			self.close();
			callbacks.cancel && callbacks.cancel();
		}
		
		//instument cancel behavior
		var ind;
		
		if (Ti.Platform.osname !== 'android') {
			var b = Ti.UI.createButton({
				title:'Cancel',
				style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
			});
			self.setRightNavButton(b);
			b.addEventListener('click', cancel);
		}
		else {
			self.addEventListener('android:back',cancel);
			self.addEventListener('open', function() {
				//Also, do a special activity indicator for android
				ind = Ti.UI.createActivityIndicator({
					location: Ti.UI.ActivityIndicator.STATUS_BAR,
					type: Ti.UI.ActivityIndicator.DETERMINANT,
			    		message:'Loading...',
				});
				ind.show();
			});
		}
		
		//consumer of this window will want to take action based on URL
		webView.addEventListener('load', function(e) {
			ind && ind.hide();
			self.fireEvent('urlChanged', e);
		});
		
		return self;
	}
	
	if (ACCESS_TOKEN) {
		//TODO: Check if token is still valid - if not, use refresh token if valid.  If not, reauthorize.
		callbacks.success();
	}
	else {
		var authWindow = new AuthorizationWindow();
		
		authWindow.addEventListener('urlChanged', function(e) {
			info(e.url);
		});
		
		authWindow.open();
	}
};
