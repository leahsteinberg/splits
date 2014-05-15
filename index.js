var express = require('express');
var router = express.Router();
var home = require(__dirname, 'play');
var sys = require('sys');

router.get('/', function(req, res){
	 res.render('play', { title: 'Express' });

});


module.exports = router;

