const path = require('path');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/signup', userController.getSignup);

router.post('/signup', userController.postSignup);

router.get('/login', userController.getLogin);

module.exports = router;