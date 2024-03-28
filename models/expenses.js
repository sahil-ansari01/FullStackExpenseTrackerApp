const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./users');

const Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    spentAmount: {
        type: Sequelize.DECIMAL(10, 2), // Assuming the amount is in decimal format
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Expense.belongsTo(User);

module.exports = Expense;
