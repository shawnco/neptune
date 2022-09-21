const db = require('./db');
const config = require('./config');
const {Sequelize} = require('sequelize');

module.exports = db.define('moved_task', {
    id: config.pk,
    original_task: Sequelize.INTEGER,
    cron_string: Sequelize.STRING
}, config.table);