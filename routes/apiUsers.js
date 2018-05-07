let express = require('express');
let router = express.Router();
const apiUsersController = require("../controllers/apiUsersController");
const usersController = require("../controllers/usersController");


router.get('/', apiUsersController.users_get);

router.post("/logout", apiUsersController.logout_post);

router.post("/login", apiUsersController.login_post);
router.post("/signup", apiUsersController.signup_post);

router.get('/:id/', apiUsersController.user_id_get);
router.post('/:id/', /*apiUsersController.loggedInAs, apiUsersController.upload.single("image"),*/ apiUsersController.user_id_post);
router.delete('/:id/', usersController.loggedInAs, apiUsersController.user_id_delete)

router.get('/find',apiUsersController.find_get);

module.exports = router;
