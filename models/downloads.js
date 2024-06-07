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
  fileURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

Downloads.belongsTo(User);

module.exports = Downloads;
