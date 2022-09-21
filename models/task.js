const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

module.exports = db.define('task', {
    id: config.pk,
    name: Sequelize.STRING,
    completed: Sequelize.BOOLEAN,
    calendar: Sequelize.INTEGER,
    cron_string: Sequelize.STRING,
    chain: Sequelize.INTEGER,
    parent: Sequelize.INTEGER,
    duration: Sequelize.INTEGER,
    frequency: Sequelize.STRING,
    movable: Sequelize.BOOLEAN
}, config.table);