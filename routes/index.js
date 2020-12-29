var express = require('express');
var session = require('express-session') ;
// var controller = require('../controllers/Apicontroller');
var router = express.Router();

router.get('/',function(req,res){
	console.log('Inside the homepage callback function')
  	req.session.value = [1,5,4,7,5,4];  
  	req.session.save(function () {
    	res.json(req.session);
	});
 
  		// console.log(req.session.value);
})

router.get('/user',function(req,res){	
	res.json(req.session.value);
})

module.exports = router;
