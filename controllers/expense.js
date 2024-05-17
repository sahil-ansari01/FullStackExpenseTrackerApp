const path = require('path');
const Expense = require('../models/expense');
const User = require('../models/user');

exports.getExpense = async (req, res, next) => {
    try {      
        const expenses = await Expense.findAll({where: { userId: req.user.id}});
        res.status(200).json({ expenses: expenses }); 
    } catch (err) {
        res.status(500).json({ error: err.message });  
        console.log(err); 
    }   
};

exports.postExpense = async (req, res, next) => {
    try {
        const { spentAmount, description, category } = req.body; 
        const userId = req.user.id;

        const expense = await Expense.create({spentAmount, description, category, userId});
        const user = await User.findByPk(userId);
        user.totalExpense = (user.totalExpense || 0) + parseFloat(spentAmount);
        await user.save();
        
        res.status(201).json({ message: 'Expense added successfully!', data: expense });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;
        const userId = req.user.id;

        if (!expenseId) {
            return res.status(400).json({success: false, message: 'Expense ID is required!'});
        }

        const expense = await Expense.findOne({ where: {id: expenseId, userId }});

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense do not belongs to user or do not exist!'})
        }

        // Delete the expense
        const rowsDeleted = await Expense.destroy({ where: { id: expenseId, userId } });

        if (rowsDeleted === 0) {
            return res.status(404).json({ success: false, message: 'Expense does not belong to the user or does not exist' });
        }

        // Update the user's total expense
        const user = await User.findByPk(userId);
        user.totalExpense = (user.totalExpense || 0) - expense.spentAmount;
        await user.save();

        res.status(200).json({ success: true, message: 'Deleted successfully' });
        
    } catch (err) {
        console.log(err);
    }
}