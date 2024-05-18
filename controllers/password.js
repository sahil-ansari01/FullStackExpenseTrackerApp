const path = require('path');
const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.forgetPassword = async (req, res, next) => {
    try {
        const receiversEmail = req.body.email;
        if (!receiversEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }

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
            subject: 'Reset password link.',
            textContent: `
                This will give you a reset password link.
            `
        });

        console.log(sendEmail);
        return res.status(200).json({ message: 'Password reset link sent successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
