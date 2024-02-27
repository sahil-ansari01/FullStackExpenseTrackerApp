const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
// const sequelize = require('./utils/database');

var cors = require('cors');

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view engine', 'pug');
app.set('views', 'views');

const userRoutes = require('./routes/user');

app.use(express.json());
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);

app.listen(3000);
