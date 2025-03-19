const bcrypt = require("bcrypt");

const User = require("../models/user");
const sequelize = require("../utils/database");
const jwtServices = require("../services/jwtService");

exports.signUp = async (req, res) => {
    const t = await sequelize.transaction();
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    try {
        const user = await User.findOne({
            where: { email: email },
            transaction: t,
        });
        if (user === null) {
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                }
                await User.create(
                    {
                        name: name,
                        email: email,
                        phone: phone,
                        password: hash,
                    },
                    { transaction: t }
                );
                await t.commit();
                res.status(201).json({
                    success: true,
                    message: "New user created.",
                });
            });
        } else {
            res.status(403).json({
                message: "User already exists, Please login!",
            });
        }
    } catch (err) {
        await t.rollback();
        res.status(500).json(err);
    }
};

exports.logIn = async (req, res) => {
    const t = await sequelize.transaction();
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({
            where: { email: email },
            transaction: t,
        });
        if (user !== null) {
            bcrypt.compare(password, user.password, async (err, result) => {
                if (result) {
                    await t.commit();
                    res.status(200).json({
                        success: true,
                        message: "Successfully logged in.",
                        token: jwtServices.generateAccessTokenOnLogin(
                            user.id,
                            user.name
                        ),
                        userId: user.id,
                    });
                } else {
                    return res.status(401).json({
                        success: false,
                        message: "Incorrect password.",
                    });
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "User with this email id does not exist.",
            });
        }
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err, success: false });
    }
};
