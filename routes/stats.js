let express = require('express');
let router = express.Router();
const statsController = require("../controllers/statsController");

router.get('/', statsController.index_get);

module.exports = router;
