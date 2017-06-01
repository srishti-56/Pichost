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


//uses multer to store image files in folder public/uploads
router.post('/usignup', upload.single('uimg'), function(req, res) {
	/*var NewUserModel = new UserModel();
 	NewUserModel.img.data = fs.readFileSync(req.files.userPhoto.path);
 	NewUserModel.img.contentType = 'image/png';
 	NewUserModel.save();
*/
	console.log(req.file);
	console.log(req.body);
	var currDate = new Date();
	
	//checks if user exists, else adds user information to database
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

		newUser.photos[0] = {
				ptype: 'profile',
				dop : currDate,
				pname: photo_name,
				path: photo_path,
				contentType : photo_type,
				album: 'profile_photos',
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

		console.log("{status:'success', message: 'Upload sucessful! Welcome ' + req.body.uname}");
		res.redirect('/profile');

		}  
	});

});



router.post('/login', function(req,res){
	//checks if user exists in database and sets cookies and logs existing users in
	Users.find({ email: req.body.email , pwd : req.body.pwd }, function(err,results){
		if(err) throw err;
		
		else if(results.length == 0) {
			res.json({status:'fail', message: 'Check your credentials! Have you signed up with us? '});
		}	
		else{

			req.logSession.uname = results[0].name;
			req.logSession.uemail = results[0].email;
			console.log("{status:'success', message: 'Welcome ' + results[0].name + '. Start sharing photos now!'}");
			res.redirect('/profile');

		}

	});

});


//sends back profile page
router.get('/profile', function(req, res){

	res.sendFile( path.join(__dirname , '../public/html/profile.html'));

	});



//------profile.js ROUTES-------------

//sends logged in user's profile picture from db
router.get('/dispphotos', function(req, res){
	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.find({ email: req.logSession.uemail, "photos.ptype": 'profile'}, function(err, results){
			if(err) throw err;

		var res_pic = results[0].photos[0];
		console.log('sending picture' + JSON.stringify(res_pic));
		console.log(res_pic.path);
		res.send(res_pic.path);

		});
	}
	else{
		console.log("Session variables not set. Not logged in.");
	}

});

	
//sends back information on logged in user
router.get('/userinfo', function(req, res){

	if(req.logSession && req.logSession.uname && req.logSession.uemail ) {
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
			res_info.flag = 1;
			res_info.req_recieved = [];
			len_fr = results[0].req_recieved.length;
			console.log(JSON.stringify(results[0].req_recieved) );
			if(len_fr >=1){
				for(i=0; i< len_fr; i++){
				res_info.req_recieved.push(results[0].req_recieved[i]);
				console.log(res_info.req_recieved[i]);
				}

			}
			console.log(res_info.req_recieved);
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
		var res_info = {flag : 0};
		res.json(res_info);
		}

});


//qeuries for friends and returns best match
router.post('/findfriend' , function(req,res){
	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.find({email: req.body.usrname ,"photos.ptype":'profile'}, function(err,results){
			if(err) throw err;
			res_array = [];
			console.log(JSON.stringify(results));
			if(results.length >=1){
				res_info = { username : results[0].name, pic_path: results[0].photos[0].path, email:results[0].email};
			}
			else{
				res_info = { status: 'Error', message: 'User not found. Please look for a valid user'};
			}
			console.log(results.length)
			res.json(res_info);
		});
	}
	else{
		console.log("Session variables not set. Not logged in.");
	}

});	


//updates sent friend req and recieved friend request fields in db
router.post('/addfriend', function(req,res){
		
	if(req.logSession && req.logSession.uname && req.logSession.uemail) {

		Users.find({email: req.body.username}, function(err,results){
			if(err) throw err;

			if(results.length<1){
				res.json({status:"error", message: "User not found. We will look into this shortly"});
			}
			else{
				var tmp_flag =0;
				var res_friend_len = results[0].friends.length;
				var res_len = results[0].req_recieved.length;
				console.log(res_len);
				console.log(results[0].email);
				console.log(req.logSession.uemail);
				console.log(results[0].req_recieved[0]);

				for(i=0; i<res_len; i++){
					if(req.logSession.uemail == results[0].req_recieved[i].name)
						tmp_flag = 1;
				}


				if(tmp_flag == 1){
					res.json ({status: "error", message: "already sent"});
					
				}

				else {	

				for(i=0; i<res_friend_len; i++){
					if(req.logSession.uemail == results[0].friends[i].name){
						tmp_flag = 1;
					}
				}
				if (tmp_flag == 1){
					res.json({status:"Error", message:"Already friends"});
				}
				else{

				Users.update({'email': req.body.username}, {$push: {'req_recieved' : { name: req.logSession.uemail }} }, function(err){
					if (err) throw err; 
					else console.log("recieved updated");
				});		
				Users.find({email: req.logSession.uemail}, function(err, results){	 
					if(err) throw err;

				Users.update({'email': req.logSession.uemail}, {$push: {'req_sent' : { name: req.body.username} }}, function(err){
					if(err) throw err;
				});
			});
			res.json({status:"success", message: "Sent"});
		}
		}//closes else below duplicate check

			}
		});
	}
			
	else{
		console.log("Session variables not set. Not logged in.");
	}


});


//deletes sent and recieved friend req in db
router.post('/delete_req', function(req,res){

	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.update({email: req.body.c_fr_email}, {$pull: {'req_sent' : {name : req.logSession.uemail}} } , function (err){
				if(err) throw err;
			});
		Users.update({email: req.logSession.uemail}, {$pull: {'req_recieved' : {name : req.body.c_fr_email}} } , function (err){
				if(err) throw err;
			});
		console.log("deleted");
	}


	else{
		console.log("Session variables not set. Not logged in.");
	}
});


// deletes sent and recieved friend req and adds sender and reciever as friends
router.post('/confirm_req', function(req,res){

		if(req.logSession && req.logSession.uname && req.logSession.uemail) {
			f_count=0;
			var flag_f = 0;
			Users.find({email:req.body.c_fr_email}, function(err,res){
				if(err) throw err;
				f_count = res[0].friend_count;
				var len_fr = res[0].friends;
				for(i=0;i<len_fr;i++){
					if(req.logSession.uname == res[0].friends[len_fr].name){
						res.json({status:"Error", message: "Already friends"});
						flag_f = 1;
						break;
					}
				}

				if(flag_f == 0){
					Users.update({email: req.body.c_fr_email}, {$pull: {'req_sent' : {name : req.logSession.uemail}} } , function (err){
						if(err) throw err;
					});
					Users.update({email: req.body.c_fr_email}, {$push: {'friends' : {name : req.logSession.uemail}} } , function (err){
						if(err) throw err;
					});
					Users.find({email:req.body.c_fr_email}, function(err,res){
						if(err) throw err;
						f_count = res[0].friend_count;
					});
					Users.update({email: req.body.c_fr_email}, {$set: {'friend_count' : f_count+1 } } , function(err){
						if(err) throw err;
					});

					Users.update({email: req.logSession.uemail}, {$pull: {'req_recieved' : {name : req.body.c_fr_email}} } , function (err){
						if(err) throw err;
					});
					Users.update({email: req.logSession.uemail}, {$push: {'friends' : {name : req.body.c_fr_email}} } , function (err){
						if(err) throw err;
					});
					Users.find({email:req.logSession.uemail}, function(err,res){
						if(err) throw err;
						f_count = res[0].friend_count;
					});
					Users.update({email: req.logSession.uemail}, {$set: {'friend_count' : f_count+1 }} , function(err){
						if(err) throw err;
					});

						}
					});
			

		}

		else{
		console.log("Session variables not set. Not logged in.");
	}

});

//updates and adds image information of logged in user to db (path of image is saved) 
router.post('/addphotos', upload.single('uimg'), function(req,res){
	var currDate = new Date();
	console.log(req.file);
	console.log(req.body);
	if(req.file){
			var photo_path = req.file.path;
			var photo_type = req.file.mimetype;
			//var ext = photo_type.substring(str.indexOf("/") + 1);
			var photo_name = req.file.originalname
			console.log('name :' + photo_name);

			Users.find({ email:req.logSession.uemail}, function(err,results){
				var p_flag= 0;
				var p_len = results[0].photos.length;
				for(i=0; i< p_len; i++){
					if(results[0].photos[i].name == req.file.originalname){
						p_flag = 1;
						break;
					}
					if(i == p_len -1){
						if(p_flag == 1){
					res.json({status:"Error", message:"Duplicate name, please rename the file or upload another one"});
				}
				else{
					Users.update({ email:req.logSession.uemail}, {$push: {'photos' : {'ptype': 'normal', 'dop' : currDate, 'pname': photo_name, 'path': photo_path,	'contentType' : photo_type, 'album': ''}}}, function(err){
					if (err) throw err;

					Users.update({ email:req.logSession.uemail}, {$set: {'photo_count': p_len+1}}, function(err){
						if (err) throw err;
					});
					});

					res.redirect('/profile');
				}

					}
				}

				

			});
	}
	else{
		console.log("Picture not valid!");
	}


});


//sends back paths of all photos og logged in user
router.get('/loadphotos', function(req,res){

	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.find({email:req.logSession.uemail}, function(err,results){

						if(err) throw err;
						var final_res = []
						var res_pic = results[0].photos;
						var p_len = res_pic.length;
						var res_paths = [];
						for(i=0; i<p_len; i++){
							final_res.push({
								path : res_pic[i].path,
								name: res_pic[i].pname,
							})
						}	
						console.log(final_res);
						res.send(final_res);
					});
	

	}

	else{
		console.log("Session variables not set. Not logged in.");
	}

});


//sends back friend names/email of logged in user 
router.get('/newsfeed', function(req,res){
	res_friends = [];
	res_pictures = [];
	if(req.logSession && req.logSession.uname && req.logSession.uemail) {
		Users.find({email: req.logSession.uemail}, function(err, results){
			if(err) throw err;
			console.log(JSON.stringify(results));
			len_f = results[0].friends.length;
			console.log("No of friends " + len_f);
			for(p = 0; p< len_f; p++){
				res_friends.push({
					name: results[0].friends[p].name
				})
				console.log('newsfeed results' + results[0].friends[p].name);
			}
			console.log('Names of all frineds:' + JSON.stringify(res_friends));
			res.send(res_friends);

		});

	}

	else{
		console.log("Session variables not set. Not logged in.");
	}
});


//sends back photos associated with user's email (newsfeed friend list sent here)
//Seperate routes for friend names and each friends photos as photos take a long time to load
router.post('/nphotos', function(req,res){

	if(req.logSession && req.logSession.uname && req.logSession.uemail) {


		Users.find({email: req.body.fname}, function(err, fresults){
			if (err) throw err;
			console.log(JSON.stringify(fresults));
			x_len = fresults[0].photos.length;
			console.log("No of photos" + x_len);
			for( b= 0; b<x_len; b++){
				//res_pictures[b] = fresults[0].photos[b].path;
				res_pictures.push({
				path: fresults[0].photos[b].path,
				name: fresults[0].photos[b].pname,
				usrname: fresults[0].name
			})
			if(b==4){
				break;
			}
		}
		console.log(res_pictures);
		res.send(res_pictures);


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

/*
router.get('/newsfeed', function(req, response){
	console.log("In newsfeed");
	news_res = [];

	if(req.logSession && req.logSession.uname && req.logSession.uemail) {

			Users.find({email : req.logSession.uemail} , function(err, results){
				if(err) throw err;
				var res_friends = [];
				var len_fri = results[0].friends.length;

console.log('no of friends' + len_fri);
				for(g=0; g<len_fri; g++){
					console.log(results[0].friends[g].name);
					res_friends.push(results[0].friends[g].name);
					console.log(res_friends);

					Users.find({email : res_friends[g]} , function(err,innerResults){
						if(err) throw err;
						console.log(JSON.stringify(innerResults));
						console.log('inner' +innerResults[0].photos.length);
						j=0;
						new_count = innerResults[0].photos.length;
						while(j<new_count){
							console.log(innerResults[0].photos[j].path);
							console.log(innerResults[0].photos[j].pname);
							console.log(innerResults[0].photos[j].likes);
							console.log(news_res);
							news_res.push({
								path: innerResults[0].photos[j].path,
								name: innerResults[0].photos[j].pname,
								likes : innerResults[0].photos[j].likes
							})
						j++;

						}
						if(g == len_fri && j==new_count){
							response.send(news_res);
						}

					});
				
					//for looping
				}

			});

			

		}

	else{
		console.log("Session variables not set. Not logged in.");
		res.json({status:'fail'})
	}

	var news_path = JSON.stringify(result[b].path);
							news_path = news_path.replace(/"/g,"");
		  					news_path = news_path.replace(/public\//g,"");		  			
		  					news_path = "http://localhost:3030/" + news_path;
		  				
							$("#newsfeed").prepend('<div id="nf_photos" class="well"><div> <img style="width:40%; height:auto" id="friend_photo" img src="'+ news_path + '"> </img> </div><div> <b><p id="friend_user"> Uploaded by: '+  result[b].usrname + ' </p> </b</div> </div'  );


}); */