const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const Downloads = sequelize.define('downloads', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    filename: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileURL: Sequelize.STRING,
    
});

Downloads.belongsTo(User);

module.exports = Downloads;