//
// Authentiq ID
//
(function (hello) {

	function formatError(o, headers) {
		var code = headers ? headers.statusCode : null;
		var auth_header = headers["WWW-Authenticate"];
		var message = o.message;
		if ((code === 401 || code === 403)) {
			o.error = {
				code: "access_denied",
				message: message
			};
		}
	}

	function formatUser(o) {
		if (o.sub) {
			o.name = o.name || (o.given_name + " " + o.family_name);
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
				'me': 'userinfo'
			},
			wrap: {
				me: function (o, headers) {
					formatError(o, headers);
					formatUser(o);
					return o;
				}
			},
			xhr: function (p) {
				p.headers['Accept'] = 'application/json';
				return true;
			}
		}
	});

})(hello);
