const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();

//Load User Model
require("../models/User");
const User = mongoose.model("users");

//User Login Route
router.get("/login", (req, res) => {
  res.render("users/login");
});

//User Register Route
router.get("/register", (req, res) => {
  res.render("users/register");
});

//Login Form POST
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    //local is the name of the strategy (email/password)
    successRedirect: "/ideas",
    failureRedirect: "/users/login",
    failureFlash: true //enable flash messages
  })(req, res, next);
});

//Register Form POST
router.post("/register", (req, res) => {
  console.log("Register post request body: ", "\n", req.body);
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: "Passwords do not match" });
  }

  if (req.body.password.length < 6) {
    errors.push({ text: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    //check if the user has already registered
    User.findOne({ email: req.body.email }).then(user => {
      //if user is found, throw error and redirect to register page
      if (user) {
        req.flash("error_msg", "Email already registered");
        res.redirect("/users/login");
      }
      //if user is not found, create new user and hash password
      else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      }
    });
  }
});

// Logout User GET
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Logout Successful");
  res.redirect("/users/login");
});
module.exports = router;
