const mongoose = require('mongoose');
const Expense = require('../models/expense');
const User = require('../models/user');
const Downloads = require('../models/downloads');
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services');

exports.getExpense = async (req, res, next) => {
    try {      
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;

        const expenses = await Expense.find({ user: req.user._id })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json({ expenses }); 
    } catch (err) {
        res.status(500).json({ error: err.message });  
        console.log(err); 
    }   
};

exports.postExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { spentAmount, description, category } = req.body; 
        const userId = req.user._id;

        const expense = new Expense({
            spentAmount,
            description,
            category,
            user: userId
        });
        await expense.save({ session });

        const user = await User.findById(userId).session(session);
        user.totalExpense = (user.totalExpense || 0) + parseFloat(spentAmount);
        await user.save();

        await session.commitTransaction();
        res.status(201).json({ message: 'Expense added successfully!', data: expense });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: err.message });
        console.log(err);
    } finally {
        session.endSession();
    }
};

exports.deleteExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const expenseId = req.params.id; // Get the expense ID from the request parameters
        const userId = req.user._id; // Get the user ID from the authenticated user

        // Check if the expense ID is provided
        if (!expenseId) {
            return res.status(400).json({ success: false, message: 'Expense ID is required!' });
        }

        // Find the expense by ID and user ID
        const expense = await Expense.findOne({ _id: expenseId, user: userId }).session(session);

        // Check if the expense exists
        if (!expense) {
            await session.abortTransaction(); // Abort the transaction if the expense is not found
            return res.status(404).json({ success: false, message: 'Expense does not belong to user or does not exist!' });
        }

        // Delete the expense
        await Expense.deleteOne({ _id: expenseId, user: userId }).session(session);

        // Update the user's total expense
        const user = await User.findById(userId).session(session);
        user.totalExpense = (user.totalExpense || 0) - expense.spentAmount; // Deduct the spent amount
        await user.save();

        // Commit the transaction
        await session.commitTransaction();
        res.status(200).json({ success: true, message: 'Deleted successfully' });
        
    } catch (err) {
        await session.abortTransaction(); // Abort the transaction on error
        console.error('Error deleting expense:', err); // Log the error for debugging
        res.status(500).json({ error: 'Internal server error' }); // Send a generic error message
    } finally {
        session.endSession(); // End the session
    }
};

exports.downloadExpense = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const expenses = await UserServices.getExpenses(req);
        const stringifyExpenses = JSON.stringify(expenses, null, 2);
        const filename = `Expense_${userId}_${new Date().toISOString()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifyExpenses, filename);

        const downloads = new Downloads({
            user: userId,
            filename,
            fileURL,
        });
        await downloads.save();

        res.status(200).json({ fileURL, success: true, downloads });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDownloads = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;

        const downloads = await Downloads.find({ user: req.user._id })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json(downloads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
};