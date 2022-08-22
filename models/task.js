const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

module.exports = db.define('task', {
    id: config.pk,
    name: Sequelize.STRING,
    completed: Sequelize.BOOLEAN,
    calendar: Sequelize.INTEGER,
    cron_string: Sequelize.STRING
}, config.table);