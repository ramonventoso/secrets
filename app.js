//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

const app = express()
app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    email: String, 
    password: String
})
 
userSchema.plugin(encrypt, { 
    secret: process.env.SECRET, 
    encryptedFields: ['password']
 })

const User = new mongoose.model('User', userSchema)


app.get('/', function(request, response) {
    response.render('home')
})

app.route('/login')
.get(function(request, response) {
    response.render('login')
})
.post(function(request, response) {
    User.findOne({ email: request.body.username }, function(err, user) {
        if (!err) {
            if (user) {
                if (user.password === request.body.password) {
                    response.render('secrets')
                } 
                else {
                    console.log('Password is incorrect')
                    response.send('Password is incorrect')
                }               
            }
            else {
                console.log('User does not exists in the database')
                response.send('User does not exists in the database')
            }
        }
        else {
            console.log(err)
        }
    })
})

app.route('/register')
.get(function(request, response) {
    response.render('register')
})
.post(function(request, response) {
    const newUser = new User({
        email: request.body.username, 
        password: request.body.password
    })

    newUser.save(function(err) {
        if (!err) {
            response.render('secrets')
        }
        else {
            console.log(err)
        }
    })
})

// app.get('/secret', function(request, response) {
//     response.render('secret.ejs')
// })


// app.get('/submit', function(request, response) {
//     response.render('submit.ejs')
// })

app.listen(3000, function() {
    console.log('Server listening on port 3000')
})