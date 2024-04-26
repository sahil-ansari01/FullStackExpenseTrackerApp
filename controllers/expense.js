const path = require('path');
const Expense = require('../models/expense');

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
        const { spentAmount, description, category, userId } = req.body; 
        const expense = await Expense.create({spentAmount, description, category, userId });
        res.status(201).json({ message: 'Expense added successfully!', data: expense });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
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