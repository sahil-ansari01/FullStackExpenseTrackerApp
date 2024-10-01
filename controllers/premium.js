const User = require('../models/user');
const Expense = require('../models/expense');

exports.checkPremiumStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
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

        const leaderboardofusers = await User.aggregate([
            {
                $lookup: {
                    from: 'expenses',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'expenses'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    total_cost: { $sum: '$expenses.spentAmount' }
                }
            },
            { $sort: { total_cost: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
        ]);

        res.status(200).json(leaderboardofusers); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
};