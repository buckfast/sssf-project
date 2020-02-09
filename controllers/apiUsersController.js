const User = require('../models/user');
const passport = require("passport");
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const dateformat = require('date-format');
const sharp = require('sharp');
const multer = require("multer");
const path = require('path');


exports.loggedInAs = (req, res, next) => {
  if (req.isAuthenticated() && typeof req.user !== "undefined" && req.user.username === req.params.id) {
    next();
  }
  else {
    res.json({ error: "not authenticated" });
  }
}

/**
 * @api {post} /logout Log out user
 * @apiName LogOut
 * @apiGroup Users
 * @apiDescription Logs out
 */
exports.logout_post = (req, res, next) => {
  if (res.user) {
    req.logout();
    delete req.session.username;
    res.json({ logout: 'succesful' })
  } else {
    res.json({ logout: 'not authenticated' })

  }
}

/**
 * @api {get} /users/ Request User information
 * @apiName GetUsers
 * @apiGroup Users
 * @apiParam {String} name query by name
 * @apiParam {String} id query by id
 * @apiDescription Gets user by the param. Gets all users when params not used
 */
exports.users_get = (req, res, next) => {
  if (req.query.id) {
    User.findOne({ '_id': req.query.id }, 'username _id registered aboutMe avatar gamesPlayed gamesWon', (err, user) => {
      if (err) {
        res.json({ error: "not found" });
        return;
      };
      if (user) {
        res.json({ user });
      } else {
        res.json({ error: "not found" });
      }
    });
  } else if (req.query.name) {
    User.findOne({ 'username': req.query.name }, 'username _id registered aboutMe avatar gamesPlayed gamesWon', (err, user) => {
      if (err) {
        res.json({ error: err });
        return;
      };
      if (user) {
        res.json({ user });
      } else {
        res.json({ error: "not found" });
      }
    });
  } else if (Object.keys(req.query).length === 0) {
    User.find({}, 'username _id registered aboutMe avatar gamesPlayed gamesWon', (err, users) => {
      let usersobj = {};
      users.forEach((user) => {
        usersobj[user._id] = user;
      });
      res.json(usersobj);
    });
  } else {
    res.json({ error: "unknown query" })
  }


}

/**
 * @api {post} /users/login Log in user
 * @apiName LogIn
 * @apiGroup Users
 * @apiParam {String} username
 * @apiParam {String} password
 * @apiDescription Logs in
 */
exports.login_post = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err) }
    if (!user) {
      return res.json({
        formData: { username: req.body.username }, errors: [{ param: "username", msg: info.message }]
      });
    }

    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.json({
        formData: { username: req.body.username }, errors: null
      });
    });
  })(req, res, next);
}

/**
 * @api {post} /users/signup Sign up user
 * @apiName SignUp
 * @apiGroup Users
 * @apiParam {String} username
 * @apiParam {String} password
 * @apiParam {String} password2 password confirmation
 * @apiDescription Creates a new user
 */
exports.signup_post = [
  body('username', 'Username required').isLength({ min: 1 }).trim(),
  body('username', 'Username must be 3-16 characters').isLength({ min: 3, max: 16 }).trim(),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }).trim(),
  body("password", "Passwords do not match").custom((value, { req, loc, path }) => {
    if (value !== req.body.password2) {
      throw new Error("Passwords don't match");
    } else {
      return value;
    }
  }),
  body("username", "Invalid username").custom((value, { req, loc, path }) => {
    const regex = /^[0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;<,>.?\/\\~`]+[0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;<,>.?\/\\~`]*$/g
    if (!regex.test(value)) {
      throw new Error("Invalid username");
    } else {
      return value;
    }
  }),
  sanitizeBody('username').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    //console.log(errors.array());
    if (!errors.isEmpty()) {
      res.json({ formData: { username: req.body.username }, errors: errors.array() });
      return;
    } else {
      User.findOne({ username: req.body.username }, (err, user) => { // TODO: make this a custom validation
        if (err) {
          return (err);
        }
        if (!user) {
          console.log("tehaas ukko");
          const user = new User({ username: req.body.username, passwordHash: req.body.password, registered: new Date() });
          user.save()
            .then(user => {
              req.login(user, err => {
                if (err) next(err);
                //else res.redirect("/");
                res.json({ formData: { username: req.body.username, registered: user.registered, id: user._id }, errors: null });
              });
            })
            .catch(err => {
              res.json({ formData: { username: req.body.username }, errors: err });
            });
        } else {
          res.json({ formData: { username: req.body.username }, errors: [{ param: "username", msg: "Username is taken" }] });
        }
      });
    }
  }
]

/**
 * @api {get} /users/:name Request User information
 * @apiName GetUser
 * @apiGroup Users
 * @apiParam {String} name Users name
 * @apiDescription Gets user by name
 */
exports.user_id_get = (req, res, next) => {
  User.findOne({ 'username': req.params.id }, 'username _id registered aboutMe avatar gamesPlayed gamesWon', (err, user) => {
    if (err) { res.json({ error: err }) };
    if (user) {
      res.json({ user });
    } else {
      res.json({ error: "not found" });
    }
  });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

exports.upload = multer({ storage: storage });


/**
 * @api {post} /users/:name/ Create user
 * @apiName EditUser
 * @apiGroup Users
 * @apiParam {String} aboutMe
 * @apiParam {String} [avatar]
 * @apiDescription Edit user information
 */
exports.user_id_post = (req, res, next) => {
  console.log(req.file);

  console.log(req.body.aboutme)

  const update = (filename) => {
    let avatar;
    if (filename != undefined) {
      avatar = 'avatar' + filename;
    } else {
      avatar = req.user.avatar;
    }

    let user = new User(
      {
        registered: req.user.registered,
        aboutMe: req.body.aboutme,
        avatar: avatar,
        _id: req.user._id,
      }
    );
    User.findByIdAndUpdate(req.user._id, user, {}, (err, data) => {
      if (err) { res.json({ error: err }) }
      let updatedElements = {};
      if (req.body.aboutme != undefined) { updatedElements["aboutme"] = req.body.aboutme };
      if (filename != undefined) { updatedElements["avatar"] = avatar }
      res.json({ updatedElements: updatedElements });
    });
  }

  if (req.file != undefined) {
    sharp('public/images/' + req.file.filename)
      .resize(100, 100)
      .toFile('public/images/avatar' + req.file.filename, (err) => {
        if (err) { res.json({ error: err }) }

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

/**
 * @api {delete} /users/:name/ Delete user
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiDescription Delete user
 */
exports.user_id_delete = (req, res, next) => {
  const username = req.user.username;
  const id = req.user._id;
  User.findOneAndRemove({ _id: req.user._id }, (err) => {
    if (err) {
      res.json({ error: "not allowed" });
    }
    console.log("deleted");
    req.logout();
    res.json({ deleted: true, username: username, id: id });
  });
}

/**
 * @api {get} /users/find Find User information
 * @apiName FindUsers
 * @apiGroup Users
 * @apiParam {String} minplayed users with this many played games
 * @apiDescription Gets users matching the criteria
 */
exports.find_get = (req, res, next) => {
  User.find({ gamesPlayed: { $gt: req.query.minplayed - 1 } }, "username _id registered aboutMe avatar gamesPlayed gamesWon", (err, users) => {
    if (err) {
      res.json({ error: "not found" });
    }
    res.json(users);
  })

}
