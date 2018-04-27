let express = require('express');
let router = express.Router();
const gameController = require("../controllers/gameController");

router.get('/', gameController.game_get);
router.post('/', gameController.game_post);
router.get('/:id/', gameController.game_id_get);


module.exports = router;
