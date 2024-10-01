const path = require('path');
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
const ForgetPasswordRequest = require('../models/forgetPasswordRequest');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.forgetPassword = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const receiversEmail = req.body.email;
        if (!receiversEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email: receiversEmail });
        if (!user) {
            return res.status(404).json({error: 'User not found!'});
        }   

        const resetRequestId = uuidv4();

        const forgetPasswordRequest = new ForgetPasswordRequest({
            _id: resetRequestId,
            userId: user._id,
            isActive: true
        });
        await forgetPasswordRequest.save({ session });

        const sender = {
            email: 'sahilansari66435@gmail.com',
            name: 'Sahil Ansari'
        };

        const receivers = [
            {
                email: receiversEmail
            }
        ];

        const sendEmail = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset password link',
            textContent: `
            This is your reset password link: http://localhost:3000/resetpassword/${resetRequestId}
            `
        });

        await session.commitTransaction();
        console.log(sendEmail);
        return res.status(200).json({ message: 'Password reset link sent successfully' });

    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

exports.getResetPassword = async (req, res, next) => {
    try {
        const resetRequestId = req.params.id;
        const resetRequest = await ForgetPasswordRequest.findOne({ _id: resetRequestId, isActive: true });

        if (!resetRequest) {
            return res.status(400).json({ error: 'Invalid or expired reset link!'});
        }

        res.sendFile(path.join(__dirname, '..', 'public', 'html', 'resetpassword.html'));
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error!'});
    }
};

exports.postResetPassword = async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const resetRequestId = req.params.id;
        const { password } = req.body;

        const resetRequest = await ForgetPasswordRequest.findOne({ _id: resetRequestId, isActive: true }).session(session);

        if(!resetRequest) {
            return res.status(400).json({ error: 'Invalid or expired reset link'});
        }

        const user = await User.findById(resetRequest.userId).session(session);

        if(!user) {
            return res.status(404).json({ error: 'User not found!'});
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;
        await user.save();

        resetRequest.isActive = false;
        await resetRequest.save();

        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Password reset successful!' });

    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        res.status(500).json({ error: 'Internal server error!'});
    } finally {
        session.endSession();
    }
};