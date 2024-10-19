const express = require('express');
const router = express.Router();
const techController = require('../controllers/techNews');

router.get('/', techController.getTechNews);

module.exports = router;