const path = require('path');
const User = require('../models/user');
const Expense = require('../models/expense');
const jwt = require('jsonwebtoken');

exports.checkPremiumStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (user && user.ispremiumuser) {
            return res.status(200).json({ isPremium: true });
        } else {
            return res.status(200).json({ isPremium: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.showLeaderboard = async (req, res, next) => {
    try {
        const expenses = await Expense.findAll();
        res.status(200).json({ expenses: expenses }); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
}