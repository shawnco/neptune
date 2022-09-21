const db = require('./db');
const config = require('./config');
const {Sequelize} = require('sequelize');

module.exports = db.define('active_hour', {
    id: config.pk,
    calendar: Sequelize.INTEGER,
    day: Sequelize.INTEGER,
    start: Sequelize.INTEGER,
    end: Sequelize.INTEGER
}, config.table);