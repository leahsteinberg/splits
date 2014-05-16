var express = require('express');
var router = express.Router();
var home = require(__dirname, 'play');
var sys = require('sys');
var https = require('https');
var CLIENT_ID = require('./secret_code.js').client_id;

console.log("client id is, ", CLIENT_ID);
router.get('/', function(req, res){
	 res.render('signin', { title: 'Express' });

});

router.get('/room', function(req, res){
	console.log(req.query['access_token']);
	req.session.access_token = req.query['access_token'];
	 res.render('play', { title: 'Express' });

});

router.get('/venmo', function(req, res){
	console.log("hit venmo");
	//var CLIENT_ID = "jDyzzQh4RNK78RTrWk6LQy8NFjPvZSNy";// this was called secret
	//var CLIENT_ID = "LfnDKsWfCTAW4N3ML4TBGJUJpD7KknTa"// this was called access token online
	var redirect_string = "https://api.venmo.com/v1/oauth/authorize?client_id="+ CLIENT_ID+"&scope=make_payments%20access_profile";
	res.json(redirect_string);
});


router.get('/venmo_user', function(req, res){
	console.log("sjdfklsdjHIIIII");
	console.log("in venmo user, ", req.session.access_token);
	var options = {host: 'api.venmo.com',
					path: '/v1/me?access_token='+req.session.access_token,
					method: 'GET'}

	var req = https.get(options, function(http_res){
		console.log('STATUS:', http_res.statusCode);
		http_res.on('data', function (chunk) {
		 	venmo_response = chunk;
    		res.json(JSON.parse(chunk));
  		});
	});
	console.log("request is ", req);
		req.on('error', function(e) {
  		console.error(e);
	});
});


module.exports = router;

