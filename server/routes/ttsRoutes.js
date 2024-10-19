const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');

router.post('/', ttsController.convertTextToSpeech);

module.exports = router;