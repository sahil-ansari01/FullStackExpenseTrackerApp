const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const ForgetPasswordRequest = sequelize.define('forgetPasswordRequest', {
    id:{ 
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
})

module.exports = ForgetPasswordRequest;