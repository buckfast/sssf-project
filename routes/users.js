let express = require('express');
let router = express.Router();
const usersController = require("../controllers/usersController");


router.get('/', usersController.users_get);
router.post('/', usersController.users_post);
router.get("/logout", usersController.logout_get);

router.get("/login", usersController.login_get);
router.get("/signup", usersController.signup_get);
router.post("/login", usersController.login_post);
router.post("/signup", usersController.signup_post);
router.get('/:id/', usersController.user_id_get);
router.post('/:id/', usersController.user_id_post);
router.put('/:id/', usersController.user_id_put);
router.delete('/:id/', usersController.user_id_delete);

module.exports = router;
