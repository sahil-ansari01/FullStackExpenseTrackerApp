const path = require('path');
const User = require('../models/user');
const Expense = require('../models/expense');
const jwt = require('jsonwebtoken');
const express = require('express');
const sequelize = require('sequelize');

exports.checkPremiumStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (user && user.ispremiumuser) {
            return res.status(200).json({ isPremium: true });
        } else {
            return res.status(200).json({ isPremium: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.showLeaderboard = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 3;
        const offset = (page - 1) * pageSize;

        const leaderboardofusers = await User.findAll({
            attributes: ['id', 'name',[sequelize.fn('sum', sequelize.col('expenses.spentAmount')), 'total_cost']],
            include: [
                {
                    model: Expense,
                    attributes: []
                }
            ],
            group: ['user.id'],
            order: [['total_cost', 'DESC']]
        });

        const paginatedData = leaderboardofusers.slice(offset, offset + pageSize);
        res.status(200).json(paginatedData ); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
}