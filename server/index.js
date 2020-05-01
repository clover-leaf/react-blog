const express      = require('express');
const mongoose     = require('mongoose');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const config       = require('./config/key');

const { User } = require('./models/user');
const { auth } = require('./middleware/auth') 
const app = express();

mongoose.connect(config.mongoURI, {
						useNewUrlParser: true,
						useFindAndModify: false,
						useCreateIndex: true
						})
							.then(()=>console.log('DB connected'))
							.catch(err => console.error(err));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());


app.post('/api/users/register', (req, res) => {
	const user = new User(req.body);
	user.save((err, doc) => {
		if(err) return res.json({success: false, err});
		return res.status(200).json({
			success: true,
			userData: doc
		});
	})	
})

app.post('/api/users/login', (req, res) => {
	User.findOne({email: req.body.email}, (err, user) => {
		if(err) return res.status(400).send(err);
		if(!user) return res.json({
			loginSuccess: false,
			message: 'email not found'
		})
		user.comparePassword(req.body.password, (err, isMatch) => {
			if(err) return res.status(400).send(err);
			if(!isMatch){
				return res.json({
					loginSuccess: false,
					message: "wrong password"
				});
			}
			user.generateToken((err, user) => {
				if(err) return res.status(400).send(err);
				res.cookie('x_auth', user.token)
				.status(200)
				.json({
					loginSuccess: true
				})
			})
		})
	})
})

app.get('/api/users/auth', auth, (req, res) => {
	res.status(200).json({
		isAuth: true,
		email: req.user.email,
		password: req.user.password
	})
})

app.get('/api/users/logout', auth, (req, res) => {
	User.findOneAndUpdate({_id: req.user._id}, {token: ''}, (err, doc) => {
		if(err) return res.status(400).json({
			success: false
		})
		return res.json({
			success: true
		})
	})
})

app.get('/', (req, res)=>{
	res.send('hi world');
})

const port = process.env.PORT || 1006

app.listen(port, () => {
	console.log(`Server running on ${port}`)
});