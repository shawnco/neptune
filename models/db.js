const path = require('path');
const Sequelize = require('sequelize');
const options = {
    host: 'localhost',
    user: 'root',
    password: '',
    db: 'neptune',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

module.exports = new Sequelize(options.db, options.user, options.password, {
    host: options.host,
    dialect: options.dialect,
    operationsAliases: false,
    pool: {...options.pool}
});