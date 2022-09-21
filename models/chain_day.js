const db = require('./db');
const config = require('./config');
const Sequelize = require('sequelize').Sequelize;

const ChainDay = db.define('chain_day', {
    chain: Sequelize.INTEGER,
    day: Sequelize.INTEGER
}, config.table);
ChainDay.removeAttribute('id');

module.exports = ChainDay;