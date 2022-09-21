const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

const TaskDay = db.define('task_day', {
    task: Sequelize.INTEGER,
    day: Sequelize.INTEGER
}, config.table);
TaskDay.removeAttribute('id');

module.exports = TaskDay;