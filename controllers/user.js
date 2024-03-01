const path = require('path');
const User = require('../models/users');

function isStringValidate(string) {
    if (string.length === 0 || string == undefined) {
        return true;
    } else {
        return false;
    }
} 

exports.getSignup  = async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'public', 'html' , 'signup.html'));
    } catch {
        res.status(404).json({
            error: err
        })
    }
}

exports.postSignup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (isStringValidate(name) || isStringValidate(email) || isStringValidate(password)) {
            return res.status(400).json({
                err: 'Bad parameters. Something is missing '
            })
        }

        const existingUser = await User.findOne({where: { email: email }});
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const UserData = await User.create({
            name: name,
            email: email,
            password: password
        });
        // res.status(201).json({message: 'User created successfully!'})
        res.redirect('/user/login');
        console.log(UserData);
    } catch (err) {
        console.log(err);
        res.status(500).json( { error: err.message });
    }
}

exports.getLogin = async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'public', 'html' , 'login.html'));
    } catch {
        res.status(404).json({
            error: err
        })
    }
}