const path = require('path');
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password');
const userAuth = require('../middleware/auth');

router.post('/forgetpassword', passwordController.forgetPassword, userAuth.authenticate);

module.exports = router;