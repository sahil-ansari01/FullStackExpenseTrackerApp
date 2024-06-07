const path = require('path');
const Expense = require('../models/expense');
const User = require('../models/user');
const Downloads = require('../models/downloads');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services');

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
    const t = await sequelize.transaction();
    try {
        const { spentAmount, description, category } = req.body; 
        const userId = req.user.id;

        const expense = await Expense.create({spentAmount, description, category, userId}, { transaction: t });
        const user = await User.findByPk(userId, { transaction: t });
        user.totalExpense = (user.totalExpense || 0) + parseFloat(spentAmount);
        await user.save({ transaction: t });    
        
        await t.commit();
        res.status(201).json({ message: 'Expense added successfully!', data: expense });

    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
        console.log(err);
    }
}

exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;
        const userId = req.user.id;

        if (!expenseId) {
            return res.status(400).json({success: false, message: 'Expense ID is required!'});
        }

        const expense = await Expense.findOne({ where: {id: expenseId, userId }, transaction: t });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Expense do not belongs to user or do not exist!'})
        }

        // Delete the expense
        const rowsDeleted = await Expense.destroy({ where: { id: expenseId, userId }, transaction: t });

        if (rowsDeleted === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Expense does not belong to the user or does not exist' });
        }

        // Update the user's total expense
        const user = await User.findByPk(userId, { transaction: t });
        user.totalExpense = (user.totalExpense || 0) - expense.spentAmount;
        await user.save({ transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: 'Deleted successfully' });
        
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message })
        console.log(err);
    }
}

exports.downloadExpense = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const expenses = await UserServices.getExpenses(req);
        const stringifyExpenses = JSON.stringify(expenses, null, 2);
        const filename = `Expense_${userId}_${new Date().toISOString()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifyExpenses, filename);

        // Save download details to Downloads model
        const downloads = await Downloads.create({
            userId,
            filename,
            fileURL,
        });

        res.status(200).json({ fileURL, success: true, downloads });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDownloads = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const downloads = await Downloads.findAll({ where: { userId } });
        res.status(200).json(downloads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
