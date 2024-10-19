const express = require('express');
const router = express.Router();
const rashifalController = require('../controllers/rashifal');

router.get('/', rashifalController.getRashifal);

module.exports = router;