const path = require('path');
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');
const userAuth = require('../middleware/auth')

router.get('/getExpense', userAuth.authenticate, expenseController.getExpense);

router.post('/postExpense',userAuth.authenticate, expenseController.postExpense);

router.delete('/deleteExpense/:id', userAuth.authenticate, expenseController.deleteExpense);

router.get('/download', userAuth.authenticate, expenseController.downloadExpense);

router.get('/getDownloads', userAuth.authenticate, expenseController.getDownloads);

module.exports = router;