const User = require('../models/user');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

exports.login_get = (req, res, next) => {
  res.render("login", { title: 'Log in', currentPage: "login"})
}

exports.login_post = (req,res,next) => {

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
  sanitizeBody('username').trim().escape(),

(req,res,next) => {
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    console.log("eka errori");
    res.render('signup', {formData: {username: req.body.username}, title: 'Sign up', currentPage: "signup", user: req.user, errors: errors.array()});

    return;
  } else {
    User.findOne({username: req.body.username}, (err, user) => {
      if (err)  {
         console.log("ollaa findonessa");
         return (err);
       }
      if (!user) {
        console.log("tehaas ukko");
          const user = new User({username: req.body.username, passwordHash: req.body.password});
          user.save()
            .then(user => {
              console.log("ja onnaa");
              req.login(user, err => {
                if (err) next(err);
                else res.redirect("/");
              });
            })
            .catch(err => {
              res.render('signup', { title: 'Sign up', currentPage: "signup", user: req.user, errors: err});
            });
        } else {
          res.render('signup', { title: 'Sign up', currentPage: "signup", user: req.user, errors: ["Username taken"]});
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
    res.send("get user id "+req.params.id);
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
