// Define environment variables. It is very important to require at in the beginning.
require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const enctypt = require("mongoose-encryption")

const app = express()

// To apply css in localhost: 3000
app.use(express.static("public"))

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({
    extended: true
}))

//TODO - User DB
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// Add Encryption
userSchema.plugin(enctypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"]
})

const User = new mongoose.model("User", userSchema)

//TODO - App
// Root Page
app.get("/", function (req, res) {
    res.render("home")
})

// Login Page
app.get("/login", function (req, res) {
    res.render("login")
})

app.post("/login", function (req, res) {
    const userName = req.body.username
    const password = req.body.password

    User.findOne({
        email: userName
    }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    })
})

//  Register page
app.get("/register", function (req, res) {
    res.render("register")
})

app.post("/register", function (req, res) {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("New user successfully saved");
            res.render("secrets")
        }
    })
})

//TODO - Listen the port
app.listen(3000, function () {
    console.log("Server started on port 3000");
})