const sequelize = require('../utils/database');
const User = require('./user');
const Group = require('./group');
const GroupChat = require('./groupChat');
const GroupMember = require('./groupMember'); // Assuming you have a GroupMember model


// Define associations
User.hasMany(GroupMember, { foreignKey: 'userId' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(GroupMember, { foreignKey: 'groupId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(GroupChat, { foreignKey: 'userId' });
Group.hasMany(GroupChat, { foreignKey: 'groupId' });
GroupChat.belongsTo(User, { foreignKey: 'userId' });
GroupChat.belongsTo(Group, { foreignKey: 'groupId' });
User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

module.exports = { sequelize, User, Group, GroupChat, GroupMember };