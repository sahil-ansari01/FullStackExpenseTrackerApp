const path = require('path');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/signup', userController.getSignup);

router.post('/signup', userController.signup);

router.get('/login', userController.getLogin);

router.post('/login', userController.postLogin);

module.exports = router;