const path = require('path');
const User = require('../models/users');

function isStringValidate(string) {
    return string === undefined || string.length === 0;
} 

exports.getSignup  = async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'public', 'html' , 'signup.html'));
    } catch (err) {
        res.status(404).json({
            error: err
        });
    }
};

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (isStringValidate(name) || isStringValidate(email) || isStringValidate(password)) {
            return res.status(400).json({
                error: 'Bad parameters. Something is missing'
            });
        }

        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        await User.create({ name, email, password });
        res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getLogin = async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'public', 'html' , 'login.html'));
    } catch (err) {
        res.status(404).json({
            error: err
        });
    }
};
