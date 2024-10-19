const express = require('express');
const router = express.Router();
const sportsController = require('../controllers/sportsNews');

router.get('/', sportsController.getSportsNews);

module.exports = router;