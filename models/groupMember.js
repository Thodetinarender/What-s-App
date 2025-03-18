const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');
const Group = require('./group');

const GroupMember = sequelize.define("groupMember", {
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id',
        }
    },
    groupId: {
        type: Sequelize.INTEGER,
        references: {
            model: Group,
            key: 'id',
        }
    }
}, { timestamps: true });



module.exports = GroupMember;