var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('client-sessions');
var api = require('./routes/api');


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public/uploads'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({
	cookieName: 'logSession',
	secret: 'pichost',
	duration: 1 * 2 * 60 * 1000, 			//2min
	activeDuration: 8 * 1 * 60 * 1000		//5min
}));

app.use(api)



/*app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/html/index.html');

});
app.get('/login.html', function(req, res){
	res.sendFile(__dirname + '/public/html/login.html');

});*/


app.get('*', function(req, res) {
	res.send('404');
});

app.post('*', function(req, res) {
	res.send('404');
});




app.listen(3030, function(req,res){
	console.log("listening on 3030");
});
