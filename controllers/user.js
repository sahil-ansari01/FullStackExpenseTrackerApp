const path = require('path');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, ispremiumuser: false });
        await newUser.save();
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

function generateAccessToken(id, name) {
    return jwt.sign({userId : id , name: name}, process.env.SECRET_KEY);
}

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (isStringValidate(email) || isStringValidate(password)) {
            return res.status(400).json({message: 'Email or Password is missing!'});
        }
        
        const user = await User.findOne({ email });
        if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                const token = generateAccessToken(user._id, user.name);
                return res.status(200).json({success: true, message: 'User logged in successfully!', token: token});
            } else {
                return res.status(400).json({success: false, message: 'Password is incorrect!'});
            }
        } else {
            res.status(404).json({success: false, message: 'User does not exist!'});
        }

    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};