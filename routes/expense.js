const path = require('path');
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');

router.get('/getExpense', expenseController.getExpense);

router.post('/postExpense', expenseController.postExpense);

router.delete('/deleteExpense/:id', expenseController.deleteExpense);

module.exports = router;