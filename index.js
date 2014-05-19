var express = require('express');
var router = express.Router();
var home = require(__dirname, 'play');
var sys = require('sys');
var https = require('https');
var CLIENT_ID = require('./secret_code.js').client_id;
//var passport = require('passport');

console.log("client id is, ", CLIENT_ID);

router.get('/', function(req, res){
	 res.render('signin', { title: 'Express' });

});

router.get('/room', function(req, res){
	console.log(req.query['access_token']);
	req.session.access_token = req.query['access_token'];
	console.log("saving R S AT", req.session.access_token);
	 res.render('play', { title: 'Express' });

});

router.get('/venmo', function(req, res){
	console.log("hit venmo");
	//var CLIENT_ID = "jDyzzQh4RNK78RTrWk6LQy8NFjPvZSNy";// this was called secret
	//var CLIENT_ID = "LfnDKsWfCTAW4N3ML4TBGJUJpD7KknTa"// this was called access token online
	var redirect_string = "https://api.venmo.com/v1/oauth/authorize?client_id="+ CLIENT_ID+"&scope=make_payments+access_balance+access_friends+access_email+access_feed%20access_profile";
	res.json(redirect_string);
});


router.get('/venmo_user', function(req, res){
	console.log('in venmo user, r R S A T is ', req.session.access_token);

	var options = {host: 'api.venmo.com',
					path: '/v1/me?access_token='+req.session.access_token,
					method: 'GET'}

	var req = https.get(options, function(http_res){
		//console.log('STATUS:', http_res.statusCode);
		http_res.on('data', function (chunk) {
    		res.json(JSON.parse(chunk));
    		console.log("data from venmo user, ", JSON.parse(chunk));
  		});
	});
		req.on('error', function(e) {
  		console.error(e);
	});
});

router.get('/venmo_user_friends', function(req, res){
	var user_id = req.query['id'];
	console.log("###", user_id);
	var options = {host: 'api.venmo.com',
					path: '/v1/users/'+user_id+'/friends?access_token='+req.session.access_token,
					method: 'GET'}
	var request = https.get(options, function(http_res){
		http_res.on('data', function (chunk) {
			var friends_object = {};
			friends_object['friends'] = [];
			var received_data = JSON.parse(chunk);
			console.log("new url is: ", received_data['pagination']['next']);
			for(var i =0; i< received_data['data'].length; i++){
				console.log("hiii", received_data['data'][i]['username']);
				friends_object['friends'].push({'user_name': received_data['data'][i]['username'], 'display_name': received_data['data'][i]['display_name'], 'id': received_data['data'][i]['id']});
			}


			var next_url= received_data['pagination']['next'];
			next_params = next_url.slice(next_url.indexOf('/v1'));
			var options2 = {host: 'api.venmo.com',
					path: next_params+'&access_token='+req.session.access_token,
					method: 'GET'}
					console.log("next_params is    ", next_params);
			var request2 = https.get(options2, function (http_res2){
					http_res2.on('data', function(chunk){
						console.log(JSON.parse(chunk));
									var received_data = JSON.parse(chunk);
			console.log("new url is: ", received_data['pagination']['next']);
			for(var i =0; i< received_data['data'].length; i++){
				console.log("hiii", received_data['data'][i]['username']);
				friends_object['friends'].push({'user_name': received_data['data'][i]['username'], 'display_name': received_data['data'][i]['display_name'], 'id': received_data['data'][i]['id']});
			}
			
			res.json(friends_object);


					});
			});

			// make next request
			
			console.log(friends_object['friends']);


    		//res.json(friends_object);
  		});
  		request.on('error', function(e) {
			console.log("got an error!");
  		console.error(e);
	});
	});
	//console.log("request is ", req);
		
});


module.exports = router;

