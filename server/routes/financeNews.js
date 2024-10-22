const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeNews');

router.get('/', financeController.getFinanceNewsData);

module.exports = router;