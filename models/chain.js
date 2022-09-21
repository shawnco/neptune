const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

module.exports = db.define('chain', {
    id: config.pk,
    frequency: Sequelize.STRING
}, config.table);