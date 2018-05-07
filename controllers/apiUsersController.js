const User = require('../models/user');
const passport = require("passport");
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const dateformat = require('date-format');
const sharp = require('sharp');
const multer = require("multer");
const path = require('path');


exports.logout_post = (req,res,next) => {
  res.send("logout user");
}


exports.users_get  = (req,res,next) => {
  res.send("get all users");
}


exports.login_post = (req,res,next) => {
  res.send("login user");
}

exports.signup_post = (req,res,next) => {
  res.send("signup user");
}

exports.user_id_get = (req,res,next) => {
  User.findOne({'username': req.params.id}, 'username _id registered aboutMe avatar', (err, user) => {
    if (err) {res.json({error: err})};
    if (user) {
      res.json({user});
    } else {
      res.json({error: "not found"});
    }
  });
}


exports.loggedInAs = (req,res,next) => {
  res.send("is logged in");
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()+path.extname(file.originalname));
  }
})

exports.upload = multer({storage: storage});

exports.user_id_post = (req,res,next) => {
  res.send("update user "+req.params.id);
}

exports.user_id_delete = (req,res,next) => {
  User.findOneAndRemove({_id: req.user._id}, (err) => {
      if (err) {
        res.json({error: err});
      }
      console.log("deleted");
      req.logout();
      res.json({deleted: true});
    });
}

exports.find_get = (req,res,next) => {
  res.send("find users");
}
