var Sequelize = require("sequelize");
var CronJob = require("cron").CronJob;
require("dotenv").config({ path: "../.env" });

const sequelize = require("./database");

// get yesterday's date
let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday = yesterday.toISOString().split("T")[0];

// cronjob
exports.job = new CronJob(
    "0 3 * * *",
    async () => {
        await sequelize.query(
            `insert into archives (content, createdAt, userId, groupId) select content, createdAt, userId, groupId from messages where messages.createdAt <= '${yesterday}'`,
            {
                type: Sequelize.QueryTypes.INSERT,
            }
        );
        await sequelize.query(
            `delete from messages where messages.createdAt <= '${yesterday}'`,
            {
                type: Sequelize.QueryTypes.DELETE,
            }
        );
        console.log("Successfully transferred");
    },
    null,
    true,
    "Asia/Kolkata"
);
