var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/'})


//var util = require('util');



var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://127.0.0.1:27017/picdb', function() {
	console.log('connected to db');
});

var Users = require('../models/usermodel');


router.post('/usignup', upload.single('uimg'), function(req, res) {
	/*var NewUserModel = new UserModel();
 	NewUserModel.img.data = fs.readFileSync(req.files.userPhoto.path);
 	NewUserModel.img.contentType = 'image/png';
 	NewUserModel.save();
*/
	console.log(req.file);
	console.log(req.body);
	var currDate = new Date();
	

	Users.find({ email: req.body.uemail }, function(err,results){

		if(err) throw err;
		else if(results.length > 0){
			console.log("User exists");
			res.json({status:'fail', message: 'User already exists, please log in!'});
		}

		else if(results.length == 0){
		var newUser = new Users({
			name: req.body.uname,
	    	email: req.body.uemail,
	    	pwd: req.body.upwd,
	    	dob: req.body.udob,
	    	friends: [],
	    	req_sent: [],
	    	req_recieved: [],
	    	friend_count : 0,
			photo_count: 1
		});


		if(req.file){
			var photo_path = req.file.path;
			var photo_type = req.file.mimetype;
			//var ext = photo_type.substring(str.indexOf("/") + 1);
			var photo_name = req.file.originalname
			console.log('name' + photo_name);

		newUser.photos = {
				ptype: 'profile',
				dop : currDate,
				pname: photo_name,
				path: photo_path,
				contentType : photo_type,
				album: 'profile_photos'
			}

		newUser.save( function(err, newUser){
			if (err) throw err;
		});

		}
		else{
			console.log("Not signed up! Picture not valid");
		}
		

		req.logSession.uname = req.body.uname;
		req.logSession.uemail = req.body.uemail;

		res.json({status:'success', message: 'Upload sucessful! Welcome ' + req.body.uname});

		}  
	});

});

router.post('/login', function(req,res){

	Users.find({ email: req.body.email , pwd : req.body.pwd }, function(err,results){
		console.log(JSON.stringify(results[0].email));
		if(err) throw err;
		
		else if(results.length == 0) {
			res.json({status:'fail', message: 'Check your credentials! Have you signed up with us? '});
		}	
		else{

			req.logSession.uname = results[0].name;
			req.logSession.uemail = results[0].email;
			res.json({status:'success', message: 'Welcome ' + results[0].name + '. Start sharing photos now!'});

		}

	});

});

router.get('/profile', function(req, res){

	res.sendFile( path.join(__dirname , '../public/html/profile.html'));

	});


router.post('/photos', function(req, res){
	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.find({ email: req.logSession.uemail , "photos.ptype": 'profile'}, function(err, results){
			if(err) throw err;

		var res_pic = results[0].photos;
		console.log('sending picture' + JSON.stringify(res_pic));
		console.log(res_pic.path);
		res.send(res_pic.path);

		});
	}
	else{
		console.log("Session variables not set. Not logged in.");
	}




});


//------profile.js ROUTES
router.post('/userinfo', function(req, res){

	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.find({ email: req.logSession.uemail }, function(err, results){
			if(err) throw err;
			var res_info ={ username: ''};
			console.log(results.length);
			var format = JSON.stringify(results);
			var keys = [];
			for(var k in results[0]) {
				keys.push(k);
				//console.log(k);
			}
			/*var user_name = results[0].name;
			var profile_pic = results[0].photos.img.data;
			var pic_type = results[0].photos.img.contentType;
*/
			res_info.username = results[0].name;
			res_info.email = results[0].email;
			res_info.dob = results[0].dob;
			res_info.friend_count = results[0].friend_count;
			res_info.photo_count = results[0].photo_count;

			/*res_info.profile_pic = results[0].photos.img.data;
			res_info.pic_type = results[0].photos.img.contentType;*/
			console.log('hello' + res_info.username);
			//res.contentType(pic_type);
			res.json(res_info);
			console.log("sent");
		});
		}
	else{
		console.log("Session variables not set. Not logged in.");
	}

});

		


router.get('/', function(req, res){
	res.sendFile( path.join(__dirname , '../public/html/index.html'));

});
router.get('/login', function(req, res){
	res.sendFile( path.join(__dirname , '../public/html/login.html'));

});

module.exports = router;