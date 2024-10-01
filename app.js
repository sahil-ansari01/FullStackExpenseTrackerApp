// app.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./util/database');

mongoose.set('strictQuery', false); 

const app = express();

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), 
    {flags: 'a'}
);

app.use(cors());
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "script-src 'self' cdnjs.cloudflare.com cdn.jsdelivr.net checkout.razorpay.com 'unsafe-inline'"
    );
    next();
});

app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/resetpassword', passwordRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });