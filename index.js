const express = require('express')
const app = express()

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://mixxim:thanghay@react-blog-e9yii.mongodb.net/test?retryWrites=true&w=majority', {
	useNewUrlParser: true})
	.then(()=>console.log('DB connected'))
	.catch(err => console.error(err))

app.get('/', (req, res)=>{
	res.send('hello world');
})

app.listen(1006);