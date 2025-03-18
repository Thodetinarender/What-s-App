const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');
const Group = require('./group');

const GroupChat = sequelize.define("groupChat", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, 

{
    timestamps: true,
    tableName: 'group_chats'
});

module.exports = GroupChat;