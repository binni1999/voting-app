const mongoose = require('mongoose')

const mongoUrl = process.env.MONGODB_URL_LOCAL;
mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.on('connected', () => {
    console.log('Connection Established')
})
db.on('error', (err) => {
    console.log("There is some error ", err);

});
db.on('disconnected', () => {
    console.log("The server is disconnected");

})

module.exports.db;