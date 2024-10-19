const express = require('express');
const router = express.Router();
const paraphraseController = require('../controllers/paraphaser');

router.post('/', paraphraseController.paraphraseText);

module.exports = router;