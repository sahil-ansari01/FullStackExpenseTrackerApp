const path = require('path');
const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premium');
const userAuth = require('../middleware/auth');

router.get('/premiumstatus', userAuth.authenticate, premiumController.checkPremiumStatus)

router.get('/showLeaderboard', userAuth.authenticate, premiumController.showLeaderboard);

module.exports = router;