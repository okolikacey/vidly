const mongoose = require('mongoose')
const winston = require('winston'); //for error logging
const logger = require('./logging');

const dbInstance = process.env.DBINSTANCE


module.exports = function() {
    mongoose.connect(dbInstance)
    .then(()=> logger.info(`Connected to ${dbInstance}`));
}