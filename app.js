// Define environment variables. It is very important to require at in the beginning.
require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
// Encryption
// const enctypt = require("mongoose-encryption")

// Hashing
// const md5 = require("md5")

// Salting
// const bcrypt = require("bcrypt")
// const saltRounds = 10

// Sessions
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()

// To apply css in localhost: 3000
app.use(express.static("public"))

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

//TODO - User DB
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

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
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function (err) {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })
})

//  Register page
app.get("/register", function (req, res) {
    res.render("register")
})

app.post("/register", function (req, res) {
    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            res.redirect("/register")
        } {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })
})

// Secrets page
app.get("/secrets", function (req, res) {
    User.find({
        "secret": {
            $ne: null
        }
    }, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            if (foundUsers) {
                res.render("secrets", {
                    usersWithSecrets: foundUsers
                })
            }
        }
    })
})

// Logout page
app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/")
        }
    })

})

// Submit page
app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit")
    } else {
        res.redirect("/login")
    }
})

app.post("/submit", function (req, res) {
    const submittedSecret = req.body.secret

    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                foundUser.secret = submittedSecret
                foundUser.save(function () {
                    res.redirect("/secrets")
                })
            }
        }
    })
})

//TODO - Listen the port
app.listen(3000, function () {
    console.log("Server started on port 3000");
})