const path = require('path');

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
    res.redirect('/user/signup')
}