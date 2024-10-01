const Expense = require('../models/expense');

const getExpenses = async (req, where = {}) => {
    try {
        console.log('User ID:', req.user._id);
        console.log('Where condition:', where);

        const query = { 
            user: req.user._id,
            ...where
        };

        console.log('Final query:', query);

        const expenses = await Expense.find(query);
        return expenses;
    } catch (err) {
        console.error('Error in getExpenses service:', err);
        throw new Error('Failed to fetch expenses');
    }
};

module.exports = {
    getExpenses
};