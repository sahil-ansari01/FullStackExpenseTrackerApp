const path = require('path');
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password');
const userAuth = require('../middleware/auth');

router.post('/forgetpassword', passwordController.forgetPassword, userAuth.authenticate);
router.get('/:id', passwordController.getResetPassword, userAuth.authenticate);
router.post('/:id', passwordController.postResetPassword, userAuth.authenticate);

module.exports = router;