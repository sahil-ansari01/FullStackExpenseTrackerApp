const path = require('path');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const expenseController = require('../controllers/expense');
const userAuth = require('../middleware/auth');

router.get('/signup', userAuth.authenticate, userController.getSignup);

router.post('/signup', userAuth.authenticate, userController.signup);

router.get('/login', userAuth.authenticate, userController.getLogin);

router.post('/login', userAuth.authenticate, userController.postLogin);

module.exports = router;