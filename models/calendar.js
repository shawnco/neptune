const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

module.exports = db.define('calendar', {
    id: config.pk,
    name: Sequelize.STRING,
    active: Sequelize.BOOLEAN
}, config.table);