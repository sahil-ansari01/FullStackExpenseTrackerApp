const path = require('path');
const User = require('../models/user');

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

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const UserData = await User.create({
            name: name,
            email: email,
            password: password
        });
        res.redirect('/user/signup')    
        console.log(UserData);
    } catch (err) {
        console.log(err);
        res.status(500).json( { error: err.message });
    }
}