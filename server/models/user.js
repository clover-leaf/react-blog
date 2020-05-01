const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const saltRounds = 10;
const userSchema = mongoose.Schema({

	name: {
		type: String,
		maxlength: 50
	},
	lastname: {
		type: String,
		maxlength: 50
	},
	email: {
		type: String,
		trim: true,
		unique: 1
	},
	password: {
		type: String,
		minlength: 5
	},
	role: {
		type: Number,
		default: 0
	},
	token: {
		type: String
	},
	tokenExp: {
		type: Number
	}

})

userSchema.pre('save', function(next){
	var user = this;
	if(user.isModified('password')){
		bcrypt.genSalt(saltRounds, function(err, salt){
			if(err) return next(err);
			bcrypt.hash(user.password, salt, function(err, hash){
				if(err) return next(err);
				user.password = hash;
				next()
			})
		})
	} else {
		next();
	}
})

userSchema.statics.findByToken = function(token, cb) {
	jwt.verify(token, 'mixxim', (err, decode) => {
		User.findOne({'_id': decode, 'token': token}, (err, user) => {
			if(err) return cb(err);
			cb(null, user);
		})
	})
}

userSchema.methods.comparePassword = function(plainPassword, cb){
	bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
		if(err) return cb(err);
		cb(null, isMatch);
	})
}

userSchema.methods.generateToken = function(cb){
	var token = jwt.sign(this._id.toHexString(), 'mixxim');
	this.token = token;
	this.save((err, user) => {
		if(err) cb(err);
		cb(null, user);
	})
}


const User = mongoose.model('User', userSchema)
module.exports = {User}

