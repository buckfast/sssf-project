let express = require('express');
let router = express.Router();
const usersController = require("../controllers/usersController");


router.get('/', usersController.users_get);
router.get("/logout", usersController.logout_get);

router.get("/login", usersController.login_get);
router.get("/signup", usersController.signup_get);
router.post("/login", usersController.login_post);
router.post("/signup", usersController.signup_post);
router.get('/:id/', usersController.user_id_get);
router.get('/:id/edit',usersController.loggedInAs, usersController.user_id_edit_get);
router.post('/:id/edit',usersController.loggedInAs, usersController.upload.single("image"), usersController.user_id_edit_post);
// router.put('/:id/', usersController.user_id_put);
// router.delete('/:id/', usersController.user_id_delete);

module.exports = router;
