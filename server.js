const express = require('express')
const app = express();
require('dotenv').config();
const db = require('./db')
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('App is running on port ', PORT);

})