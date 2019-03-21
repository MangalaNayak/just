
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/FourSquareAppDatabase');

console.log("this is a new line")
module.exports = {mongoose};