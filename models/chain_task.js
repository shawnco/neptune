const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

const ChainTask = db.define('chain_task', {
    chain: Sequelize.INTEGER,
    task: Sequelize.INTEGER,
    next_task: Sequelize.INTEGER
}, config.table);
ChainTask.removeAttribute('id');

module.exports = ChainTask;