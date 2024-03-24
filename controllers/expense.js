const path = require('path');
const Expense = require('../models/expenses');

exports.getExpense  = async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'public', 'html' , 'expense.html'));
    } catch (err) {
        res.status(404).json({
            error: err
        });
    }
};

exports.postExpense = async (req, res, next) => {
    try {
        const { spentAmount, description, category } = req.body; 
        await Expense.create({spentAmount, description, category });
        res.status(201).json({ message: 'Expense added successfully!'});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
