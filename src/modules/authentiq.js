//
// Authentiq ID
//
(function(hello) {

	function formatError(o, headers) {
		var code = headers ? headers.statusCode : null;
		var authHeader = headers['WWW-Authenticate'];
		var message = o.message;
		if ((code === 401 || code === 403)) {
			o.error = {
				code: 'access_denied',
				message: message
			};
		}
	}

	function formatUser(o) {
		if (o.sub) {
			o.name = o.name || (o.given_name + ' ' + o.family_name);
			o.first_name = o.given_name;
			o.last_name = o.family_name;
			o.thumbnail = o.picture;
		}
	}

	hello.init({
		authentiq: {
			name: 'Authentiq ID',
			oauth: {
				version: 2,
				auth: 'https://connect.authentiq.io/authorize',
				grant: 'https://connect.authentiq.io/token',
				response_type: 'token'
			},
			scope: {
				basic: 'userinfo name email phone aq:name aq:push aq:location aq:address',
				email: 'userinfo email'
			},
			scope_delim: ' ',
			base: 'https://connect.authentiq.io/',
			get: {
				me: 'userinfo'
			},
			wrap: {
				me: function(o, headers) {
					formatError(o, headers);
					formatUser(o);
					return o;
				}
			},
			logout: function(callback) {
				// Assign callback to a global handler
				var callbackID = hello.utils.globalEvent(callback);
				var redirect = encodeURIComponent(hello.settings.redirect_uri + '?' + hello.utils.param({callback:callbackID, result: JSON.stringify({force:true}), state: '{}'}));
				var token = (hello.utils.store('authentiq') || {}).access_token;

				hello.utils.iframe('https://connect.authentiq.io/authorize/logout?post_logout_redirect_uri=' + redirect + '&access_token=' + token);

				// Possible responses
				// String URL	- hello.logout should handle the logout
				// undefined	- this function will handle the callback
				// true			- throw a success, this callback isn't handling the callback
				// false		- throw a error

				if (!token) {
					// If there isn't a token, the above wont return a response, so lets trigger a response
					return false;
				}
			},

			xhr: function(p) {
				/* jscs:disable */
				p.headers['Accept'] = 'application/json';
				/* jscs:enable */
				return true;
			}
		}
	});

})(hello);
