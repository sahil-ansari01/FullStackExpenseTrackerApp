require('dotenv').config();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require('./models/orders');
const ForgetPasswordRequest = require('./models/forgetPasswordRequest');
const Downloads = require('./models/downloads');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), 
    {flags: 'a'}
);
const corsOptiions = {
  origin: true,
  Credentials: true,
};
app.use(
cors({
   origin: ["https://18.206.181.58:3000/"],
     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
     credentials: true,
}));
  
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

app.use((req, res, next)=> {
    console.log('URl: ', req.url);
    res.sendFile(path.join(__dirname, `public/html/${req.url}`))
})

// Define associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgetPasswordRequest);
ForgetPasswordRequest.belongsTo(User);

User.hasMany(Downloads);
Downloads.belongsTo(User);

// Sync database and start server
sequelize.sync()
    .then(res => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });