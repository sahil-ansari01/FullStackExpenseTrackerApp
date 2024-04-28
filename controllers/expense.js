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
        const expense = await Expense.create({spentAmount, description, category, userId: req.user.id });
        res.status(201).json({ message: 'Expense added successfully!', data: expense });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const expenseid = req.params.id;
        console.log(expenseid);
        if (expenseid == undefined || expenseid.length === 0) {
            return res.status(400).json({success: false})
        }
        Expense.destroy({where: {id: expenseid, userId: req.user.id }}).then((noOfRows) => {
            if (noOfRows === 0) {
                return res.status(404).json({success: false, message: `Expense does'nt belongs to the user`})
            }
            return res.status(200).json({success: true, message: 'Deleted Successfuly'})
        }).catch((err) => {
            console.log(err);
        })
    } catch (err) {
        console.log(err);
    }
}