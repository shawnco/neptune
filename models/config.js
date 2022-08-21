const Sequelize = require('sequelize').Sequelize;

module.exports = {
    pk: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    table: {
        freezeTableName: true,
        timestamps: false
    }
}