const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const User = require("../models/user");

const Chat = sequelize.define("chat", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false,
    }
}, { timestamps: true });

(async () => {
    await sequelize.sync();
    console.log("Chat table synced!");
})();
// ✅ Associate Chat with User
Chat.belongsTo(User, { foreignKey: "userId" });

module.exports = Chat;
