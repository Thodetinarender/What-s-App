const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Group = sequelize.define("group", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    }
}, { timestamps: true });

module.exports = Group;