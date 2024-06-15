const path = require('path');
const Sib = require('sib-api-v3-sdk');
const {v4 : uuidv4 } = require('uuid');
const ForgetPasswordRequest = require('../models/forgetPasswordRequest');
const User = require('../models/user');
const bycrpt =  require('bcrypt');
const sequelize = require('../util/database');

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.forgetPassword = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const receiversEmail = req.body.email;
        if (!receiversEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ where: { email: receiversEmail }});
        if (!user) {
            return res.status(404).json({error: 'User not found!'});
        }   

        const resetRequestId = uuidv4();

        await ForgetPasswordRequest.create(
           { 
                id: resetRequestId,
                userId: user.id,
                isActive: true
            },
            { transaction: t }
        )

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
            This is your reset password link: http://3.85.228.232:3000/resetpassword/${resetRequestId}
            `
        });

        await t.commit();
        console.log(sendEmail);
        return res.status(200).json({ message: 'Password reset link sent successfully' });

    } catch (err) {
        await t.rollback();
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getResetPassword = async (req, res, next) => {
    try {
        const resetRequestId = req.params.id;
        const resetRequest = await ForgetPasswordRequest.findOne({ where: { id: resetRequestId, isActive: true }});

        if (!resetRequest) {
                return res.status(400).json({ error: 'Invalid or expired reset link!'})
        }

        res.sendFile(path.join(__dirname, '..', 'public', 'html', 'resetpassword.html'));
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error!'});
    }
}

exports.postResetPassword = async(req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const resetRequestId = req.params.id;
        const { password } = req.body;

        const resetRequest = await ForgetPasswordRequest.findOne({ where: { id: resetRequestId, isActive: true}, transaction: t });

        if(!resetRequest) {
            return res.status(400).json({ error: 'Invalid or expired reset link'})
        }

        const user = await User.findByPk(resetRequest.userId, { transaction: t })

        if(!user) {
            return res.status(404).json({ error: 'User not found!'});
        }

        const hashedPassword = await bycrpt.hash(password, 12);

        await user.update({ password: hashedPassword }, { transaction: t });
        await resetRequest.update({ isActive: false }, { transaction: t });

        await t.commit();
        return res.status(200).json({ success: true, message: 'Password reset successful!' });

    } catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ error: 'Internal server error!'})
    }
}