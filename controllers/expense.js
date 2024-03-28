const path = require('path');
const Expense = require('../models/expenses');

exports.getExpense = async (req, res, next) => {
    try {
        const expenses = await Expense.findAll();
        res.status(200).json({ expenses: expenses }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.postExpense = async (req, res, next) => {
    try {
        const { spentAmount, description, category, userId } = req.body; 
        const expense = await Expense.create({spentAmount, description, category, userId });
        res.status(201).json({ message: 'Expense added successfully!', data: expense });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const id = req.params.id;
        const todel = await Expense.findByPk(id);
        
        const deleteExpense = todel.destroy();

        res.json({message: 'Expense removed !'});
    } catch (err) {
        console.log(err);
    }
}