var mongoose = require('mongoose');
var UserSchema = mongoose.Schema;

var UserModelSchema = new UserSchema({
    name: String,
    email: String,
    pwd: String,
    dob: Date,
    friends: [],
    req_sent: [],
    req_recieved: [],
    photo_count: Number,
    friend_count: Number,
    photos: {
        path: String,
    	pname: String,
        ptype: String,
    	slug: String,
        contentType: String,  
    	dop: Date,
    	caption : String,
    	likes : Number,
    	owner : UserSchema.Types.ObjectId,
        album: String
    }
});

var UserModel = mongoose.model('UserModel', UserModelSchema);

module.exports = UserModel;

