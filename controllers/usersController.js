const User = require('../models/user');
const passport = require("passport");
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const dateformat = require('date-format');
const sharp = require('sharp');
const multer = require("multer");
const path = require('path');
const fs = require('fs');


exports.login_get = (req, res, next) => {
  res.render("login", { title: 'Log in', currentPage: "login"})
}

exports.logout_get = (req,res,next) => {
  req.logout();
  delete req.session.username;
  res.redirect("/users/login");
}

exports.loggedInAs = (req, res, next) => {
    if (req.isAuthenticated() && typeof req.user !== "undefined" && req.user.username === req.params.id) {
      next();
    }
    else {
      //res.redirect(303,"/")
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
    }
}

exports.login_post = (req,res,next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) { return next(err)}
    if (!user) {
      return res.render("login", {formData: {username: req.body.username}, title: 'Log in', currentPage: "login", errors: [{param: "username", msg: info.message}]});
    }

    req.logIn(user, (err) => {
      if (err) {return next(err);}
      return res.redirect("/");
    });
  }) (req, res, next);
}

exports.signup_get = (req, res, next) => {
  res.render("signup", { title: 'Sign up', currentPage: "signup"})
}


exports.signup_post = [
  body('username', 'Username required').isLength({min: 1}).trim(),
  body('username', 'Username must be 3-16 characters').isLength({min: 3, max: 16}).trim(),
  body('password', 'Password must be at least 5 characters').isLength({min: 5}).trim(),
  body("password", "Passwords do not match").custom((value, {req, loc, path}) => {
    if (value !== req.body.password2) {
      throw new Error("Passwords don't match");
    } else {
      return value;
    }
  }),
  body("username", "Invalid username").custom((value, {req, loc, path}) => {
    const regex = /^[0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;<,>.?\/\\~`]+[0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;<,>.?\/\\~`]*$/g
    if (!regex.test(value)) {
      throw new Error("Invalid username");
    } else {
      return value;
    }
  }),
  sanitizeBody('username').trim().escape(),

(req,res,next) => {
  const errors = validationResult(req);
  //console.log(errors.array());
  if (!errors.isEmpty()) {
    res.render('signup', {formData: {username: req.body.username}, title: 'Sign up', currentPage: "signup", user: req.user, errors: errors.array()});

    return;
  } else {
    User.findOne({username: req.body.username}, (err, user) => { // TODO: make this a custom validation
      if (err)  {
         return (err);
       }
      if (!user) {
        console.log("tehaas ukko");
          const user = new User({username: req.body.username, passwordHash: req.body.password, registered: new Date()});
          user.save()
            .then(user => {
              req.login(user, err => {
                if (err) next(err);
                else res.redirect("/");
              });
            })
            .catch(err => {
              res.render('signup', {formData: {username: req.body.username}, title: 'Sign up', currentPage: "signup", user: req.user, errors: err});
            });
        } else {
          res.render('signup', {formData: {username: req.body.username}, title: 'Sign up', currentPage: "signup", user: req.user, errors: [{param: "username", msg: "Username is taken"}]});
        }
    });
  }
  }
]

/**
 * @api {get} /users List all users
 * @apiName GetUsers
 * @apiGroup Users
 * @apiDescription Lists all users
 */
exports.users_get = (req, res, next) => {
    if (req.query.name == undefined) {
        res.send("get users list");
    } else {
      if (req.query.name) {
        res.send("search users by name "+req.query.name);
      } else {
        res.send("not found");
      }
    }

}


exports.user_id_edit_get = (req, res, next) => {
  let date = dateformat.asString('dd.MM.yyyy', req.user.registered);
  res.render("edit", {title: req.params.id, currentPage: "profile", registered: date, user: req.user});
}

// exports.user_id_edit_post = (req, res, next) => {
//     res.send("asd");
// }


exports.user_id_get = (req, res, next) => {
    //res.send("get user id "+req.params.id);
    User.findOne({username: req.params.id},"username registered avatar aboutMe",(err, user) => {
      if (err) {return (err);}

      if (user) {
        let date = dateformat.asString('dd.MM.yyyy', user.registered);
        res.render("profile", {title: req.params.id, currentPage: "profile", profileUser: {username: user.username, registered: date, avatar: user.avatar, aboutMe: user.aboutMe}, user: req.user});
      } else {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
    });
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

exports.user_id_edit_post = (req, res) => {
  console.log(req.file);

  const update = (filename) => {
    let avatar
    if (filename != undefined) {
      avatar = 'avatar'+filename;
    } else {
      avatar = req.user.avatar;
    }

    let user = new User(
       {
         registered: req.user.registered,
         aboutMe: req.body.aboutme,
         avatar: avatar,
         _id:req.user._id,
       }
     );
     User.findByIdAndUpdate(req.user._id, user, {}, (err, data) => {
       if (err) { return next(err); }
       res.redirect("/users/"+req.params.id);
    });
  }

  if (req.file != undefined) {
    sharp('public/images/'+req.file.filename)
      .resize(100, 100)
      .toFile('public/images/avatar'+req.file.filename, (err) => {
        if (err) {return next(err);}

        // fs.unlink('public/images/'+req.file.filename, (err) => {
        //   if (err) {throw err;}
        //   console.log('Deleted original: '+req.file.filename);
        // });

        update(req.file.filename)
      });
  } else {
    update(undefined);
  }
};

exports.user_id_edit_delete = (req, res, next) => {
  
}

exports.user_id_post = (req, res, next) => {
    res.send("update user id "+req.params.id);
}

exports.user_id_put = (req, res, next) => {
    res.send("update user id "+req.params.id);
}

/**
 * @api {delete} /users/:id Delete user
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiDescription Deletes user
 * @apiError UserNotFound The <code>id</code> of the User was not found
 */
exports.user_id_delete = (req, res, next) => {
    res.send("delete user id "+req.params.id);
}
