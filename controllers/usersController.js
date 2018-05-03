const User = require('../models/user');
const passport = require("passport");
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const dateformat = require('date-format');

exports.login_get = (req, res, next) => {
  res.render("login", { title: 'Log in', currentPage: "login"})
}

exports.logout_get = (req,res,next) => {
  req.logout();
  delete req.session.username;
  res.redirect("/users/login");
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
    const regex = /^[0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;"'<,>.?\/\\~`]+[0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;"'<,>.?\/\\~`]*$/g
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

/**
 * @api {post} /users Create new user
 * @apiName CreateUser
 * @apiGroup Users
 * @apiDescription Creates a new user
 */
exports.users_post = (req, res, next) => {
    res.send("create new user");
}

/**
 * @api {get} /users/:id Request user information
 * @apiName GetUser
 * @apiGroup Users
 * @apiDescription Requests user information
 * @apiError UserNotFound The <code>id</code> of the User was not found
 */
exports.user_id_get = (req, res, next) => {
    //res.send("get user id "+req.params.id);
    User.findOne({username: req.params.id},"username registered avatar aboutMe",(err, user) => {
      if (err) {return (err);}

      if (user) {
        let date = dateformat.asString('dd.MM.yyyy', user.registered);
        res.render("profile", {title: req.params.id, currentPage: "users", profileUser: {username: user.username, registered: date, avatar: user.avatar, aboutMe: user.aboutMe}, user: req.user});
      } else {
        res.send("Not found");
      }
    });
}

/**
 * @api {post} /users/:id Update user information
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiDescription Updates user information
 * @apiError UserNotFound The <code>id</code> of the User was not found
 */
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
