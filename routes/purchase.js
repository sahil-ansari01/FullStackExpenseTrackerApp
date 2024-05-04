const path = require('path');
const express = require('express'); 
const router = express.Router();
const purchaseController = require('../controllers/purchase');
const userAuth = require('../middleware/auth')

router.get('/premiummembership', userAuth.authenticate, purchaseController.purchasepremium);

router.post('/updatetransactionstatus', userAuth.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;
