const path = require('path');
const User = require('../models/users');
const bcrypt = require('bcrypt');

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

        bcrypt.hash(password, 10, async (err, hash) => {
            await User.create({ name, email, password: hash });
            res.status(201).json({ message: 'User created successfully!' });
        })

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

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (isStringValidate(email) || isStringValidate(password)) {
            return res.status(400).json({message: 'Email or Password is missing!'});
        }
        
        const user = await User.findAll({ where: { email } });
        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, (err, result) => {
                if (err) {
                    throw new Error('Something went wrong!');
                }

                if (result === true) {
                    res.status(200).json({success: true, message: 'User logged in successfully!'})
                } else {
                    return res.status(400).json({success: false, message: 'Password is incorrect!'})
                }
            })
        } else {
            res.status(404).json({success: false, message: 'User do not exist!'})
        }

    } catch (err) {
        res.status(500).json({success: false, message: err})
    }
}