const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/user');

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                console.error('Error creating Razorpay order:', err);
                const newOrder = new Order({ user: req.user._id, orderid: null, status: 'FAILED' });
                await newOrder.save();
                return res.status(500).json({ message: 'Failed to create order', error: err });
            }

            try {
                const newOrder = new Order({ user: req.user._id, orderid: order.id, status: 'PENDING' });
                await newOrder.save();
                return res.status(201).json({ order, key_id: rzp.key_id });
            } catch (error) {
                console.error('Error creating user order:', error);
                return res.status(500).json({ message: 'Failed to create order', error: error });
            }
        });
    } catch (err) {
        console.error('Error in purchasepremium:', err);
        res.status(500).json({ message: 'Something went wrong', error: err });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ orderid: order_id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentid = payment_id;
        order.status = 'SUCCESSFUL';
        await order.save();

        const user = await User.findById(req.user._id);
        user.ispremiumuser = true;
        await user.save();

        return res.status(202).json({ success: true, message: 'Transaction Successful!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};

module.exports = { purchasepremium, updateTransactionStatus };