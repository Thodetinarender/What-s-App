const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Archive = sequelize.define(
    "archive",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: Sequelize.TEXT,
        },
        createdAt: {
            type: Sequelize.DATE,
        },
        userId: {
            type: Sequelize.INTEGER,
        },
        groupId: {
            type: Sequelize.INTEGER,
        },
    },
    {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
    }
);

module.exports = Archive;
