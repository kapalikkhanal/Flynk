const express = require('express');
const router = express.Router();
const newsController = require('../controllers/allNews');

router.get('/', newsController.getNews);
router.get('/top5', newsController.getTop5News);
router.post('/', newsController.addNews);
router.get('/self', newsController.getSelfPushedNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;