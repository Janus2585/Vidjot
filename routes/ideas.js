const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

//Load Helpers
const { ensureAuthenticated } = require("../helpers/auth");

//Load Idea Model
require("../models/Idea");
const Idea = mongoose.model("ideas");

//Idea Index Page
router.get("/", ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

//Add Idea form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("ideas/add");
});

//Edit Idea form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    //verify idea belongs to logged in user
    if (idea.user != req.user.id) {
      req.flash("error_msg", "Not Authorised");
      res.redirect("/ideas");
    } else {
      res.render("ideas/edit", {
        idea: idea
      });
    }
  });
});

//Process Form
router.post("/", ensureAuthenticated, (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add details" });
  }
  if (errors.length > 0) {
    res.render("/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Idea(newUser).save().then(idea => {
      req.flash("success_msg", "Idea Added Successfully");
      res.redirect("/ideas");
    });
  }
});

//Edit Form Process
router.put("/:id", ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    //new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save().then(() => {
      req.flash("success_msg", "Idea Edited Successfully");
      res.redirect("/ideas");
    });
  });
});

//Delete Idea
router.delete("/:id", ensureAuthenticated, (req, res) => {
  Idea.remove({ _id: req.params.id }).then(() => {
    req.flash("success_msg", "Idea Deleted Successfully");
    res.redirect("/ideas");
  });
});

module.exports = router;
