const router = require('express').Router();
const MainController = require('./controllers/MainController');

router.get('/', MainController.index);
// router.post('/send-localization', MainController.send);

module.exports = router;