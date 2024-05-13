const Razorpay = require('razorpay');
require('dotenv').config();
const Order = require('../models/orders');

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
                // If order creation fails, update order status to 'FAILED' in the database
                await req.user.createOrder({ orderid: null, status: 'FAILED' });
                return res.status(500).json({ message: 'Failed to create order', error: err });
            }

            try {
                await req.user.createOrder({ orderid: order.id, status: 'PENDING' });
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
}

const updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ where: { orderid: order_id }});

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const promise1 = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = req.user.update({ ispremiumuser: true });
        Promise.all([promise1, promise2]).then(() => {
            return res.status(202).json({ success: true, message: 'Transaction Successful!' });
        }).catch(err => {
            throw new Error(err);
        })
        
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};

module.exports = { purchasepremium,updateTransactionStatus };
